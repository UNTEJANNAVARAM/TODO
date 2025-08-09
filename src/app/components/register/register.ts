import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  message: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  registerUser() {
    this.error = '';
    this.message = '';

    // Frontend field checks
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'All fields are required.';
      return;
    }

    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Enter a valid email address.';
      return;
    }

    // Password strength regex (match backend)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.error = 'Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    // Call AuthService (never direct HTTP)
    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.message = 'Registration successful! Please login.';
        this.username = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        if (err.status === 409) {
          this.error = 'User already exists, please login or use another email.';
        } else if (err.status === 400 && err.error?.error) {
          this.error = err.error.error;
        } else {
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
