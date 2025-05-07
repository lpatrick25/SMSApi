import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ConnectivityService } from './services/connectivity.service';
import type { PluginListenerHandle } from '@capacitor/core'; // Import the correct type for the listener
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  networkStatus = true;
  private loginSub?: Subscription;
  private networkSub?: PluginListenerHandle; // Update the type to PluginListenerHandle

  constructor(
    private router: Router,
    private authService: AuthService,
    private connectivityService: ConnectivityService
  ) {}

  ngOnInit() {
    this.monitorLoginStatus();
    this.listenToNetworkChanges();
  }

  monitorLoginStatus() {
    this.loginSub = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  async listenToNetworkChanges() {
    // Await the promise returned by startNetworkListener and assign the result to networkSub
    this.networkSub = await this.connectivityService.startNetworkListener((isConnected: boolean) => {
      this.networkStatus = isConnected;
      if (isConnected) {
        this.monitorLoginStatus();
      }
    });
  }

  ngOnDestroy() {
    // Remove the network listener when the component is destroyed
    this.networkSub?.remove();
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
  }

  navigateToInbox() {
    this.router.navigate(['/home']);
  }

  navigateToOutbox() {
    this.router.navigate(['/sent-messages']);
  }
}
