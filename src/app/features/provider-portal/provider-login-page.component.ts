import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderPortalService } from '../../core/provider-portal.service';

@Component({
  selector: 'app-provider-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './provider-login-page.component.html',
})
export class ProviderLoginPageComponent {
  private readonly providerPortal = inject(ProviderPortalService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly message = signal('Sign in with the provider credentials issued after approval.');
  protected readonly loading = signal(false);

  protected async login(): Promise<void> {
    if (!this.email().trim() || !this.password()) {
      this.message.set('Enter provider email and password.');
      return;
    }

    this.loading.set(true);
    this.message.set('Signing in...');
    try {
      await this.providerPortal.login(this.email(), this.password());
      this.password.set('');
      await this.router.navigateByUrl('/providers/dashboard');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Provider login failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
