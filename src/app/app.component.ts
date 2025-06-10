import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

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
      if (
        !user &&
        !['/register', '/verify-email', '/forgot-password', '/login'].includes(
          this.router.url
        )
      ) {
        this.router.navigate(['/login']);
      }
      this.loggedIn = !!user;
    });
  }
  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }
}
