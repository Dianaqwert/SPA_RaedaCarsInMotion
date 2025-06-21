import { Injectable } from '@angular/core';

interface UserAccount {
  email: string;
  isLocked: boolean;
  // other user properties
}

@Injectable({
  providedIn: 'root'
})
export class AccountSecurityService {
  private lockedAccounts: Map<string, UserAccount> = new Map();

  constructor() {}

  lockAccount(email: string) {
    this.lockedAccounts.set(email, { email, isLocked: true });
  }

  unlockAccount(email: string) {
    if (this.lockedAccounts.has(email)) {
      this.lockedAccounts.delete(email);
    }
  }

  isAccountLocked(email: string): boolean {
    return this.lockedAccounts.has(email);
  }
}
