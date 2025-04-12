import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {

  constructor(private http: HttpClient) { }

  // Check the current network status
  async checkNetworkStatus(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  // Listen for changes in network status
  startNetworkListener(callback: (status: boolean) => void) {
    Network.addListener('networkStatusChange', (status) => {
      callback(status.connected);
    });
  }

  async pingServer(url: string): Promise<boolean> {
    try {
      const response = await this.http.get(url, { responseType: 'text' }).toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }
}
