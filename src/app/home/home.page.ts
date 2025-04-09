import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmsService } from '../services/app.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  pendingSmsRequests: any[] = [];
  private intervalSubscription!: Subscription;
  private isProcessing = false;
  defaultApiUrl = environment.apiUrl;

  constructor(
    private smsService: SmsService,
    private sms: SMS,
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController,
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

  openAndroidSettings() {
    if (this.platform.is('android')) {
      window.open(
        'intent://#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;scheme=package;package=com.com.capstone.smsapi;end',
        '_system'
      );
    } else {
      this.showPermissionAlert();
    }
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

  ngOnInit() {
    this.requestPermissions();

    if (!localStorage.getItem('customApiUrl')) {
      this.presentApiUrlDialog();
    }

    this.intervalSubscription = interval(15000)
      .pipe(switchMap(() => this.smsService.getPendingSmsRequests()))
      .subscribe(async (data) => {
        this.pendingSmsRequests = data.filter(sms => sms.status === 'pending');
        if (this.pendingSmsRequests.length > 0) {
          await this.processPendingSmsQueue();
        }
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
