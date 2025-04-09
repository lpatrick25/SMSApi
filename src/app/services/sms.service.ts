import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

declare var sms: any;

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private delay = 5000;  // 5-second delay between each SMS

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  private defaultApiUrl = environment.apiUrl;

  get apiUrl(): string {
    const storedUrl = localStorage.getItem('customApiUrl');
    return storedUrl && storedUrl.trim() !== '' ? storedUrl : this.defaultApiUrl;
  }

  // Fetch all pending SMS requests from the backend
  getPendingSmsRequests(): Observable<any[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    // return this.http.get<any[]>(`${environment.apiUrl}/sms-requests`, { headers });
    return this.http.get<any[]>(`${this.apiUrl}/sms-requests`, { headers });
  }

  // Automatically check for pending SMS and send them with a delay
  async processPendingSmsQueue() {
    console.log('Checking for pending SMS...');

    this.getPendingSmsRequests().subscribe(async (smsRequests) => {
      const pendingSms = smsRequests.filter(sms => sms.status === 'pending');

      for (let i = 0; i < pendingSms.length; i++) {
        const smsRequest = pendingSms[i];

        console.log(`Preparing to send SMS to: ${smsRequest.phone_number}`);

        await this.delayExecution(this.delay * i);
        await this.sendSms(smsRequest.phone_number, smsRequest.message, smsRequest.id);
      }
    });
  }


  // Function to send an SMS
  async sendSms(phoneNumber: string, message: string, id: number) {
    return new Promise<void>((resolve) => {
      if (Capacitor.isNativePlatform()) {
        sms.send(
          phoneNumber,
          message,
          { android: { intent: '' } },
          (msg: string) => {  // Success callback
            console.log('SMS sent:', msg);
            this.updateSmsStatus(id);  // Mark SMS as sent in DB
            this.snackBar.open('SMS sent successfully!', 'Close', {
              duration: 3000,  // Show for 3 seconds
              panelClass: ['snackbar-success'],
            });
            resolve();
          },
          (err: any) => {  // Error callback
            console.error('SMS failed:', err);
            this.snackBar.open('SMS failed to send.', 'Close', {
              duration: 3000,  // Show for 3 seconds
              panelClass: ['snackbar-error'],
            });
            resolve();  // Continue with the next SMS
          }
        );
      } else {
        console.warn('SMS sending is only available on a native platform.');
        this.snackBar.open('SMS sending is not available on this platform.', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-warning'],
        });
        resolve();
      }
    });
  }

  // Function to update the SMS status in the database
  updateSmsStatus(id: number) {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    // this.http.put(`${environment.apiUrl}/sms-requests/${id}`, { status: 'sent' }, { headers })
    this.http.put(`${this.apiUrl}/sms-requests/${id}`, { status: 'sent' }, { headers })
      .subscribe(response => {
        console.log('Updated SMS status:', response);
      });
  }

  // Helper function to add a delay
  delayExecution(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
