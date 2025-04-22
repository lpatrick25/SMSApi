import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';
import { ConnectivityService } from '../services/connectivity.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  loading = false;
  networkStatus: boolean = false;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private connectivityService: ConnectivityService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.checkConnection();

    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
      console.log('Network status changed:', this.networkStatus);
    });

    this.authService.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.navCtrl.navigateRoot('/home');
      } else {
        this.checkConnection();
        this.connectivityService.startNetworkListener((isConnected) => {
          this.networkStatus = isConnected;
        });
      }
    });
  }

  async checkConnection() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();
    console.log('Initial network status:', this.networkStatus);
  }

  async login() {
    if (!this.networkStatus) {
      const toast = await this.toastCtrl.create({
        message: 'No internet connection. Please check your network.',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    if (!this.email || !this.password) {
      const toast = await this.toastCtrl.create({
        message: 'Please enter both email and password.',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    this.loading = true;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
    });

    this.http.post<any>('https://bfp.unitech.host/api/login', {
      email: this.email,
      password: this.password,
    }, { headers }).subscribe({
      next: async (res) => {
        this.loading = false;
        if (res?.token) {
          if (res.user.role == 'Admin' || res.user.role == 'Marshall') {
            await this.authService.setToken(res.token);
            this.navCtrl.navigateRoot('/home');
          } else {
            await this.showToast('Not Authorized');
          }
        } else {
          await this.showToast('Invalid response. No token received.');
        }
      },
      error: async (err) => {
        this.loading = false;
        console.error('Login Error:', err);
        await this.showToast('Login failed. Please check your credentials.');
      }
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }
}
