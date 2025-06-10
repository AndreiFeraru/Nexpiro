import { Injectable } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { ShareToken } from '../models/sharedToken';

@Injectable({
  providedIn: 'root',
})
export class ShareTokenService {
  constructor(private db: Database) {}

  async tokenExists(token: string): Promise<boolean> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    return snapshot.exists();
  }

  async getShareTokenByToken(token: string): Promise<ShareToken> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    if (!snapshot.exists()) throw 'Invalid token';

    return snapshot.val() as ShareToken;
  }

  async addShareToken(shareToken: ShareToken) {
    debugger;
    const storagePath = `sharedTokens/${shareToken.token}`;
    const storageRef = ref(this.db, storagePath);
    set(storageRef, shareToken)
      .then(() => {
        console.log(`Share token added at path: ${storagePath}`); // TODO Remove
      })
      .catch((error) => {
        console.error(
          `Error adding share token at path ${storagePath}:`,
          error
        );
      });
    this.cleanUpExpiredTokens();
  }

  async validateToken(token: string): Promise<boolean> {
    const tokenRef = ref(this.db, `sharedTokens/${token}`);
    const snapshot = await get(tokenRef);

    if (!snapshot.exists()) throw 'Invalid token';
    if (snapshot.val().expirationDate < Date.now()) throw 'Token has expired';

    this.cleanUpExpiredTokens();

    return true;
  }

  async cleanUpExpiredTokens() {
    const tokensRef = ref(this.db, `sharedTokens`);
    const snapshot = await get(tokensRef);

    if (!snapshot.exists()) return;

    const dateNow = Date.now();
    const tokens = Object.values(snapshot.val()) as ShareToken[];
    const expiredTokens = tokens.filter(
      (token) => Number(token.expirationDate) < dateNow
    );
    for (const token of expiredTokens) {
      await set(ref(this.db, `sharedTokens/${token.token}`), null);
    }
  }
}
