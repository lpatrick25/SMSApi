import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SmsService } from '../services/sms.service';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { environment } from '../../environments/environment';
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

  async confirmDeleteMessage(messageId: number) {
    const alert = await this.alertController.create({
      header: 'Delete Message',
      message: 'Are you sure you want to delete this message?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteMessage(messageId),
        },
      ],
    });

    await alert.present();
  }

  async deleteMessage(messageId: number) {
    try {
      if (!this.selectedPhoneNumber) throw new Error('No phone number selected');
      await this.smsService.deleteSentMessage(messageId);
      this.groupedMessages[this.selectedPhoneNumber] = this.groupedMessages[
        this.selectedPhoneNumber
      ].filter((msg) => msg.id !== messageId);
      if (this.groupedMessages[this.selectedPhoneNumber].length === 0) {
        delete this.groupedMessages[this.selectedPhoneNumber];
        this.selectedPhoneNumber = null;
      }
      this.showToast('Message deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete message:', err);
      this.showToast('Failed to delete message.', 'danger');
    }
  }

  async confirmDeleteGroup(phoneNumber: string) {
    const alert = await this.alertController.create({
      header: 'Delete Conversation',
      message: `Are you sure you want to delete all messages for ${phoneNumber}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteGroup(phoneNumber),
        },
      ],
    });

    await alert.present();
  }

  async deleteGroup(phoneNumber: string) {
    try {
      await this.smsService.deleteSentMessagesByPhoneNumber(phoneNumber);
      delete this.groupedMessages[phoneNumber];
      this.showToast('Conversation deleted successfully.', 'success');
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      this.showToast('Failed to delete conversation.', 'danger');
    }
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
