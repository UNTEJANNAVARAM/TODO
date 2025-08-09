import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  private apiUrl = 'http://localhost:5003/api/auth/signup';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser() {
    this.error = '';
    this.message = '';

    // ✅ Check all required fields
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'All fields are required';
      return;
    }

    // ✅ Check password match
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // ✅ Send registration request
    this.http.post(this.apiUrl, {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.message = 'Registration successful! Please login.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
