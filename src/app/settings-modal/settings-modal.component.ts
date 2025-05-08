import { Component } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
  standalone: false,
})
export class SettingsModalComponent {

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSetApiUrl() {
    this.modalCtrl.dismiss({ action: 'setApiUrl' });
  }

  async onLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => this.modalCtrl.dismiss({ action: 'logout' }),
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await alert.present();
  }

}
