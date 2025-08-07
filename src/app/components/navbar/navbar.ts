import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  isLoggedIn = signal(false);

  constructor(private authService: AuthService, private router: Router) {
    effect(() => {
      this.isLoggedIn.set(this.authService.isLoggedIn());
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
