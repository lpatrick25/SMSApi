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
  ) {}

  ngOnInit() {
    this.checkConnection();

    this.connectivityService.startNetworkListener((isConnected) => {
      this.networkStatus = isConnected;
    });

    this.authService.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        this.navCtrl.navigateRoot('/home');
      }
    });
  }

  async checkConnection() {
    this.networkStatus = await this.connectivityService.checkNetworkStatus();
  }

  async login() {
    if (!this.networkStatus) {
      this.showToast('No internet connection.', 'warning');
      return;
    }

    if (!this.email || !this.password) {
      this.showToast('Please enter email and password.', 'warning');
      return;
    }

    this.loading = true;

    const headers = new HttpHeaders({
      Accept: 'application/json',
    });

    this.http
      .post<any>(
        'https://bfp.unitech.host/api/login',
        {
          email: this.email,
          password: this.password,
        },
        { headers }
      )
      .subscribe({
        next: async (res) => {
          this.loading = false;
          if (res?.token) {
            if (res.user.role === 'Admin' || res.user.role === 'Marshall') {
              await this.authService.setToken(res.token);
              this.navCtrl.navigateRoot('/home');
              this.showToast('Login successful.', 'success');
            } else {
              this.showToast('Not authorized.', 'danger');
            }
          } else {
            this.showToast('Invalid response.', 'danger');
          }
        },
        error: async (err) => {
          this.loading = false;
          console.error('Login Error:', err);
          this.showToast('Login failed. Please check your credentials.', 'danger');
        },
      });
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
