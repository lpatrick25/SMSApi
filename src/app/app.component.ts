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
  networkStatus = true;
  private loginSub!: Subscription;

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
    this.connectivityService.startNetworkListener((isConnected: boolean) => {
      this.networkStatus = isConnected;
      if (isConnected) {
        this.monitorLoginStatus();
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
