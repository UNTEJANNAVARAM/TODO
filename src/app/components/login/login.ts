import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
  this.errorMessage = '';
  if (!this.email || !this.password) {
    this.errorMessage = 'Please enter email and password.';
    return;
  }
  this.authService.login({ email: this.email, password: this.password }).subscribe({
  next: () => this.router.navigate(['/dashboard']),
  error: (err) => {
    if (err.status === 0) {
      this.errorMessage = 'Cannot reach server. Please check your network or backend server status.';
    } else if (err.status === 401) {
      this.errorMessage = 'Invalid credentials.';
    } else if (err.status === 404) {
      this.errorMessage = 'User not found.';
    } else {
      this.errorMessage = (err.error && err.error.message) ? err.error.message : 'Login failed.';
    }
  }
});


}



  goToHome() {
    this.router.navigate(['/']);
  }
  goToRegister() {
    this.router.navigate(['/register']);
  }
}
