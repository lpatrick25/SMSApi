import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ConnectivityService } from './services/connectivity.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})

export class AppComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  networkStatus = true; // Assume online to start
  private loginSub!: Subscription;
  private networkSub!: Subscription;

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
    this.loginSub = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  listenToNetworkChanges() {
    // Subscribe to network changes from your ConnectivityService.
    // Here, we assume your service's startNetworkListener accepts a callback.
    this.connectivityService.startNetworkListener((isConnected: boolean) => {
      this.networkStatus = isConnected;
      // Optionally, you can also trigger a login check or UI update here
      if (isConnected) {
        // For instance, re-check if user is still logged in or refresh the UI.
      }
    });
  }

  ngOnDestroy() {
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
    // If connectivity service returns a subscription or has cleanup,
    // ensure you do that here.
  }

  navigateToInbox() {
    this.router.navigate(['/home']);
  }

  navigateToOutbox() {
    this.router.navigate(['/sent-messages']);
  }
}
