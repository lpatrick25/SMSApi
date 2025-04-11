import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Check the network status on page load
    this.checkConnection();
  }

  async checkConnection() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();

    if (this.networkStatus) {
      // If connected, check if the backend server (localhost) is reachable
      this.loadingMessage = 'Connected. Checking server...';
      await this.checkServerConnection();
    } else {
      // If offline, show a toast and navigate to an offline page
      this.loadingMessage = 'No internet connection. Please check your network.';
      const toast = await this.toastCtrl.create({
        message: 'You are offline. Please check your internet connection.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
  }

  // Check if the backend server is reachable
  async checkServerConnection() {
    const backendUrl = 'https://bfp.unitech.host/api/ping'; // lightweight endpoint for testing

    try {
      const response = await fetch(backendUrl, { method: 'GET' });

      if (response.ok) {
        // Server is reachable
        this.authService.isLoggedIn().then((isLoggedIn) => {
          if (isLoggedIn) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/login']);
          }
        });
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Cannot reach the server. Please ensure it is running.',
        duration: 3000,
        color: 'danger',
      });
      toast.present();
    }
  }
}
