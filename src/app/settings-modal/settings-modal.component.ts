import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings-modal',
  templateUrl: './settings-modal.component.html',
  styleUrls: ['./settings-modal.component.scss'],
  standalone: false,
})
export class SettingsModalComponent {

  constructor(private modalCtrl: ModalController) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSetApiUrl() {
    this.modalCtrl.dismiss({ action: 'setApiUrl' });
  }

  onLogout() {
    this.modalCtrl.dismiss({ action: 'logout' });
  }

}
