import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './shared/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'Nexpiro';
  loggedIn: boolean = false;

  authStateSubscription: Subscription;

  constructor(public router: Router, public authService: AuthService) {
    this.authStateSubscription = authService.authState$.subscribe((user) => {
      this.loggedIn = !!user;
    });
  }
  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }
}
