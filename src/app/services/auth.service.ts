import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'token';
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {
    this.loadLoginStatus(); // Initialize login status on service load
  }

  // Load login status at service startup
  private async loadLoginStatus() {
    const token = await this.getToken();
    this.isLoggedInSubject.next(!!token);
  }

  async setToken(token: string): Promise<void> {
    await Storage.set({ key: this.tokenKey, value: token });
    this.isLoggedInSubject.next(true); // Set logged in status
  }

  async getToken(): Promise<string | null> {
    const { value } = await Storage.get({ key: this.tokenKey });
    return value;
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  async logout(): Promise<void> {
    await Storage.remove({ key: this.tokenKey });
    this.isLoggedInSubject.next(false); // Update status
    this.router.navigate(['/login']);
  }
}
