import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  email = '';
  password = '';
  loading = false; // Optional: to show a loading spinner while waiting for the API response

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  async login() {
    if (!this.email || !this.password) {
      const toast = await this.toastCtrl.create({
        message: 'Please enter both email and password.',
        duration: 3000,
        color: 'warning',
      });
      toast.present();
      return; // Prevent submitting empty credentials
    }

    this.loading = true; // Optional: start loading indicator

    const headers = new HttpHeaders({
      'Accept': 'application/json',
    });

    this.http.post<any>('http://127.0.0.1:8000/api/login', {
      email: this.email,
      password: this.password,
    }, { headers })
      .subscribe({
        next: async (res) => {
          this.loading = false; // Stop loading indicator
          if (res?.token) {
            localStorage.setItem('token', res.token);
            this.navCtrl.navigateRoot('/home'); // Navigate to home page after successful login
          } else {
            await this.showToast('Invalid response. No token received.');
          }
        },
        error: async (err) => {
          this.loading = false; // Stop loading indicator
          console.error('Login Error:', err); // Log error for debugging
          await this.showToast('Login failed. Please check your credentials.');
        }
      });
  }

  // Function to show a toast message
  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }
}
