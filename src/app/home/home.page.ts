import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmsService } from '../services/sms.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../services/auth.service';
import { ModalController } from '@ionic/angular';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { ConnectivityService } from '../services/connectivity.service';

@Component({
  selector: 'app-root',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  pendingSmsRequests: any[] = [];
  loading = false;
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
    private connectivityService: ConnectivityService
  ) {
    if (Capacitor.isNativePlatform()) {
      this.initializeApp();
    }
  }

  async initializeApp() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#3880ff' });
    } catch (error) {
      console.error('StatusBar error:', error);
    }
  }

  requestPermissions() {
    const permissions = [
      this.androidPermissions.PERMISSION.SEND_SMS,
      this.androidPermissions.PERMISSION.READ_SMS,
      this.androidPermissions.PERMISSION.RECEIVE_SMS,
    ];

    permissions.forEach((permission) => {
      this.androidPermissions.checkPermission(permission).then((result) => {
        if (!result.hasPermission) {
          this.androidPermissions.requestPermission(permission).then((requestResult) => {
            if (!requestResult.hasPermission) {
              this.showPermissionAlert();
            }
          });
        }
      });
    });
  }

  async ngOnInit() {
    this.requestPermissions();

    if (!localStorage.getItem('customApiUrl')) {
      this.presentApiUrlDialog();
    }

    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
      if (isConnected && !this.intervalSubscription) {
        this.startFetchingPendingMessages();
      } else if (!isConnected && this.intervalSubscription) {
        this.stopFetchingPendingMessages();
      }
    });

    if (this.networkStatus) {
      this.startFetchingPendingMessages();
    }
  }

  startFetchingPendingMessages() {
    if (this.intervalSubscription) return; // Prevent multiple subscriptions

    this.loading = true;
    this.intervalSubscription = interval(15000)
      .pipe(switchMap(() => this.smsService.getPendingSmsRequests()))
      .subscribe(async (data) => {
        this.pendingSmsRequests = data.filter((sms) => sms.status === 'pending');
        this.loading = false;

        if (this.pendingSmsRequests.length > 0 && !this.isProcessing) {
          await this.processPendingSmsQueue();
        }
      });
  }

  stopFetchingPendingMessages() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
      this.intervalSubscription = null!;
    }
  }

  async processPendingSmsQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      await this.smsService.processPendingSmsQueue();
    } catch (error) {
      console.error('Error processing SMS queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  ngOnDestroy() {
    this.stopFetchingPendingMessages();
  }

  async presentSettingsModal() {
    const modal = await this.modalCtrl.create({
      component: SettingsModalComponent,
      cssClass: 'settings-modal',
    });

    modal.onDidDismiss().then((result) => {
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
          value: storedUrl || this.defaultApiUrl,
        },
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
          },
        },
      ],
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
      buttons: ['OK'],
    });

    await alert.present();
  }
}
