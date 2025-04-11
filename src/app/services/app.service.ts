import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { Storage } from '@capacitor/storage'; // Import Storage

declare var sms: any;

@Injectable({
  providedIn: 'root'
})
export class SmsService {
  private delay = 5000;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private authService: AuthService) { }

  private defaultApiUrl = environment.apiUrl;

  get apiUrl(): string {
    const storedUrl = localStorage.getItem('customApiUrl');
    return storedUrl && storedUrl.trim() !== '' ? storedUrl : this.defaultApiUrl;
  }

  getPendingSmsRequests(): Observable<any[]> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(`${this.apiUrl}/sms-requests`, { headers });
  }

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

  async sendSms(phoneNumber: string, message: string, id: number) {
    return new Promise<void>((resolve) => {
      if (Capacitor.isNativePlatform()) {
        sms.send(
          phoneNumber,
          message,
          { android: { intent: '' } },
          (msg: string) => {
            console.log('SMS sent:', msg);

            // Store sent SMS in local storage
            this.storeSentMessage(id, phoneNumber, message, 'sent');

            this.updateSmsStatus(id);
            this.snackBar.open('SMS sent successfully!', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success'],
            });
            resolve();
          },
          (err: any) => {
            console.error('SMS failed:', err);
            this.snackBar.open('SMS failed to send.', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error'],
            });
            resolve();
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

  // Store sent SMS in local storage
  async storeSentMessage(id: number, phoneNumber: string, message: string, status: string) {
    const sms = {
      id,
      phoneNumber,
      message,
      status,
      sentAt: new Date().toISOString()
    };

    // Retrieve existing messages from storage
    const storedMessages = await this.getSentMessages();

    // Add the new sent message
    storedMessages.push(sms);

    // Save the updated list back to storage
    await Storage.set({
      key: 'sentMessages',
      value: JSON.stringify(storedMessages),
    });
  }

  // Get stored sent messages
  async getSentMessages(): Promise<any[]> {
    const result = await Storage.get({ key: 'sentMessages' });
    return result.value ? JSON.parse(result.value) : [];
  }

  async loadSentMessages() {
    const sentMessages = await this.getSentMessages();
    console.log('Sent Messages:', sentMessages);
    // Use this data to display sent messages in your UI
  }

  // Helper method to group messages by phone number
  groupMessagesByPhoneNumber(messages: any[]): any {
    return messages.reduce((groupedMessages, message) => {
      const phoneNumber = message.phoneNumber;

      if (!groupedMessages[phoneNumber]) {
        groupedMessages[phoneNumber] = [];
      }
      groupedMessages[phoneNumber].push(message);
      return groupedMessages;
    }, {});
  }

  updateSmsStatus(id: number) {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.put(`${this.apiUrl}/sms-requests/${id}`, { status: 'sent' }, { headers })
      .subscribe(response => {
        console.log('Updated SMS status:', response);
      });
  }

  delayExecution(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
