import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ConnectivityService } from './services/connectivity.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  networkStatus: boolean = false;

  constructor(private router: Router, private authService: AuthService, private connectivityService: ConnectivityService) { }

  ngOnInit() {
    this.checkConnection();
  }

  async checkConnection() {

    const isServerUp = await this.connectivityService.pingServer('https://bfp.unitech.host/api/ping');

    if (!isServerUp) {
      return;
    }

    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  navigateToInbox() {
    this.router.navigate(['/home']);
  }

  navigateToOutbox() {
    this.router.navigate(['/sent-messages']);
  }
}
