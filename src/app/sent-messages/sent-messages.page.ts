import { Component, OnInit } from '@angular/core';
import { SmsService } from '../services/app.service';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { environment } from '../../environments/environment';
import { ToastController } from '@ionic/angular';
import { ConnectivityService } from '../services/connectivity.service';


@Component({
  selector: 'app-sent-messages',
  templateUrl: './sent-messages.page.html',
  styleUrls: ['./sent-messages.page.scss'],
  standalone: false,
})
export class SentMessagesPage implements OnInit {
  groupedMessages: { [phoneNumber: string]: any[] } = {};
  selectedPhoneNumber: string | null = null;
  objectKeys = Object.keys;
  defaultApiUrl = environment.apiUrl;
  loading = true;
  networkStatus: boolean = true;

  constructor(
    private smsService: SmsService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private connectivityService: ConnectivityService,
  ) { }

  async ngOnInit() {

    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    // Listen for changes
    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
      if (isConnected) {
        this.fetchSentMessages(); // retry when network returns
      }
    });

  }

  async fetchSentMessages()
  {

    try {
      const messages = await this.smsService.getSentMessages();
      this.groupedMessages = this.smsService.groupMessagesByPhoneNumber(messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      this.loading = false;
    }
  }

  async refreshMessages(event: any) {
    const messages = await this.smsService.getSentMessages();
    this.groupedMessages = this.smsService.groupMessagesByPhoneNumber(messages);
    event.target.complete();
  }

  selectPhoneNumber(phoneNumber: string) {
    this.selectedPhoneNumber = phoneNumber;
  }

  goBack() {
    this.selectedPhoneNumber = null;
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

    // After saving API URL
    const toast = await this.toastCtrl.create({
      message: 'API URL updated successfully',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    await alert.present();
  }
}
