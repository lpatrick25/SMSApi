import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private tokenKey = 'token'; // The key used to store the token

  constructor(private router: Router) {}

  // Store the token securely
  async setToken(token: string): Promise<void> {
    console.log("Setting token:", token);  // Logging for debugging
    await Storage.set({ key: this.tokenKey, value: token });
    console.log("Token set successfully.");
  }

  // Retrieve the token from Storage
  async getToken(): Promise<string | null> {
    const { value } = await Storage.get({ key: this.tokenKey });
    console.log("Retrieved token:", value);  // Logging for debugging
    return value;
  }

  // Check if the user is logged in (by checking if the token exists)
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;  // If token exists, user is logged in
  }

  // Logout: Remove the token and navigate to the login page
  async logout(): Promise<void> {
    await Storage.remove({ key: this.tokenKey });
    console.log("Token removed, logging out...");
    this.router.navigate(['/login']);  // Redirect to login page
  }
}
