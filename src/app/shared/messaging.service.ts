import { Injectable, NgZone } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  authStateSubscription: Subscription | null = null;

  constructor(
    private messaging: Messaging,
    private toastService: ToastService,
    private authService: AuthService,
    private ngZone: NgZone,
    private db: Database
  ) {
    this.getDeviceToken();
    this.onMessage();
    // Refresh the token every 12 h§ours
    setInterval(() => {
      this.getDeviceToken();
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
  }

  private async getDeviceToken(): Promise<void> {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
      });
      if (token) {
        await this.saveToken(token);
      }
    } catch (error) {
      console.log('Token error', error);
    }
  }

  private async saveToken(token: string): Promise<void> {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }

    this.authStateSubscription = this.authService.authState$.subscribe(
      async (user) => {
        if (user?.uid) {
          try {
            const itemPath = `users/${user.uid}/tokens/${token}`;
            const newItemRef = ref(this.db, itemPath);
            await set(newItemRef, true);
            console.log('Token saved successfully', token);
          } catch (error) {
            console.error('Error saving token to the database:', error);
          } finally {
            this.authStateSubscription?.unsubscribe();
          }
        }
      }
    );
  }

  private onMessage(): void {
    onMessage(this.messaging, {
      next: (payload) => {
        console.log('Message: ' + payload.notification?.title);
        this.ngZone.run(() => {
          this.toastService.showInfo(
            `${payload.notification?.title} - ${payload.notification?.body}`
          );
        });
      },
      error: (error) => console.log('Message error', error),
      complete: () => console.log('Done listening to messages'),
    });
  }

  ngOnDestroy() {
    this.authStateSubscription?.unsubscribe();
  }
}
