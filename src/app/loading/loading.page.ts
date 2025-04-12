import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ConnectivityService } from '../services/connectivity.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
  standalone: false,
})
export class LoadingPage implements OnInit {
  networkStatus: boolean = false;
  loadingMessage: string = 'Checking network connectivity...';

  constructor(
    private connectivityService: ConnectivityService,
    private toastCtrl: ToastController,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.checkConnection();
  }

  async checkConnection() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    if (this.networkStatus) {
      this.loadingMessage = 'Connected. Checking server...';
      const isServerUp = await this.connectivityService.pingServer('https://bfp.unitech.host/api/ping');

      if (isServerUp) {
        const isLoggedIn = await this.authService.isLoggedIn();
        this.router.navigate([isLoggedIn ? '/home' : '/login']);
      } else {
        this.showToast('Cannot reach the server. Please ensure it is running.', 'danger');
      }
    } else {
      this.loadingMessage = 'No internet connection. Please check your network.';
      this.showToast('You are offline. Please check your internet connection.', 'danger');
    }
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
    });
    toast.present();
  }

}
