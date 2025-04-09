import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {

  constructor() {}

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
}
