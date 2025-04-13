import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmsService } from '../services/app.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../services/auth.service';
import { ModalController } from '@ionic/angular';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { Router } from '@angular/router';
import { ConnectivityService } from '../services/connectivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  pendingSmsRequests: any[] = [];
  loading = true;
  private intervalSubscription!: Subscription;
  private isProcessing = false;
  defaultApiUrl = environment.apiUrl;
  networkStatus: boolean = true;

  constructor(
    private smsService: SmsService,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private connectivityService: ConnectivityService,
  ) {
    if (Capacitor.isNativePlatform()) {
      this.initializeApp();
    }
  }

  async initializeApp() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false }); // This ensures the content goes below the status bar
      await StatusBar.setBackgroundColor({ color: '#3880ff' }); // Match toolbar color (optional)
    } catch (error) {
      console.error('StatusBar error:', error);
    }
  }

  requestPermissions() {
    const permissions = [
      this.androidPermissions.PERMISSION.SEND_SMS,
      this.androidPermissions.PERMISSION.READ_SMS,
      this.androidPermissions.PERMISSION.RECEIVE_SMS
    ];

    permissions.forEach(permission => {
      this.androidPermissions.checkPermission(permission).then(result => {
        if (!result.hasPermission) {
          this.androidPermissions.requestPermission(permission).then(requestResult => {
            if (!requestResult.hasPermission) {
              this.showPermissionAlert();
            }
          });
        }
      });
    });
  }

  async presentSettingsModal() {
    const modal = await this.modalCtrl.create({
      component: SettingsModalComponent,
      cssClass: 'settings-modal'
    });

    modal.onDidDismiss().then(result => {
      const action = result.data?.action;
      if (action === 'setApiUrl') {
        this.presentApiUrlDialog();
      } else if (action === 'logout') {
        this.authService.logout();
      }
    });

    await modal.present();
  }

  async presentApiUrlDialog() {
    const storedUrl = localStorage.getItem('customApiUrl') || '';

    const alert = await this.alertController.create({
      header: 'Set API URL',
      inputs: [
        {
          name: 'apiUrl',
          type: 'text',
          placeholder: 'Leave blank to use default',
          value: storedUrl || this.defaultApiUrl
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            if (data.apiUrl?.trim()) {
              localStorage.setItem('customApiUrl', data.apiUrl.trim());
              console.log('Custom API URL saved:', data.apiUrl);
            } else {
              localStorage.removeItem('customApiUrl');
              console.log('Custom API URL cleared, using default.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getApiUrl(): string {
    const storedUrl = localStorage.getItem('customApiUrl');
    return storedUrl && storedUrl.trim() !== '' ? storedUrl : environment.apiUrl;
  }

  async showPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Permission Needed',
      message: 'Please enable permissions manually in device settings under Apps > YourApp > Permissions.',
      buttons: ['OK']
    });

    await alert.present();
  }

  async ngOnInit() {
    this.requestPermissions();

    if (!localStorage.getItem('customApiUrl')) {
      this.presentApiUrlDialog();
    }

    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    // Listen for changes
    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
      if (isConnected) {
        this.fetchPendingMessages(); // retry when network returns
      }
    });

    this.fetchPendingMessages();
  }

  fetchPendingMessages() {
    if (!this.networkStatus) return;

    this.loading = true;

    this.intervalSubscription = interval(15000)
      .pipe(switchMap(() => this.smsService.getPendingSmsRequests()))
      .subscribe(async (data) => {
        this.pendingSmsRequests = data.filter(sms => sms.status === 'pending');
        if (this.pendingSmsRequests.length > 0) {
          await this.processPendingSmsQueue();
        }
        this.loading = false;
      });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  async processPendingSmsQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.smsService.processPendingSmsQueue();
    } finally {
      this.isProcessing = false;
    }
  }
}
