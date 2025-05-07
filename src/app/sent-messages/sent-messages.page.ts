import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SmsService } from '../services/sms.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { environment } from '../../environments/environment';
import { ConnectivityService } from '../services/connectivity.service';

@Pipe({
  name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}

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
    private connectivityService: ConnectivityService
  ) {}

  async ngOnInit() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
      if (isConnected) {
        this.fetchSentMessages();
      }
    });

    if (this.networkStatus) {
      this.fetchSentMessages();
    }
  }

  async checkConnection() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();
    if (this.networkStatus) {
      this.fetchSentMessages();
    } else {
      this.showToast('No internet connection. Please try again.', 'danger');
    }
  }

  async fetchSentMessages() {
    try {
      const messages = await this.smsService.getSentMessages();
      this.groupedMessages = this.smsService.groupMessagesByPhoneNumber(messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
      this.showToast('Failed to load messages.', 'danger');
    } finally {
      this.loading = false;
    }
  }

  async refreshMessages(event: any) {
    try {
      const messages = await this.smsService.getSentMessages();
      this.groupedMessages = this.smsService.groupMessagesByPhoneNumber(messages);
    } catch (err) {
      this.showToast('Failed to refresh messages.', 'danger');
    } finally {
      event.target.complete();
    }
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
              this.showToast('API URL updated successfully.', 'success');
            } else {
              localStorage.removeItem('customApiUrl');
              this.showToast('Using default API URL.', 'success');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
    });
    await toast.present();
  }
}
