import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  sidebarOpen = false;
  user: any = null;  // User object

  // Edit account state
  editMode = false;
  editData: any = {};

  // Update password state
  showPasswordForm = false;
  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };

  errorMessage = '';

  currentDateTime: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.loadUserFromStorage();
    this.user = this.authService.currentUser || {};
    this.user.displayName =
    this.authService.currentUser?.name ||
    this.authService.currentUser?.username ||
    this.authService.currentUser?.displayName ||
    'User';

    this.loadUserProfile();
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
  }

  updateDateTime() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    };
    this.currentDateTime = now.toLocaleString('en-US', options);
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  goToProfile() {
    this.router.navigate(['/dashboard/profile']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToCalendar() {
    this.router.navigate(['/dashboard/calendar']);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
  globalErrorMessage: string = '';
  formErrorMessage: string = ''; // For update/edit form errors

  // Load profile from local storage or API
  loadUserProfile() {
    if (this.authService.currentUser) {
      this.user = this.normalizeUserDates(this.authService.currentUser);
      console.log('Loaded user from local storage:', this.user);
    } else {
      this.authService.getProfile().subscribe({
        next: user => {
          this.user = this.normalizeUserDates(user);
          console.log('Loaded user from API:', this.user);
        },
        error: () => this.errorMessage = 'Failed to load profile.'
      });
    }
  }

  normalizeUserDates(user: any): any {
    return {
      ...user,
      createdAt: user.createdAt || user.created_at || null,
      updatedAt: user.updatedAt || user.updated_at || null
    };
  }

  startEdit() {
    if (this.user) {
      this.editData = { ...this.user };
      this.editMode = true;
    }
  }

  saveEdit() {
    this.formErrorMessage = '';
    if (!this.editData.username || !this.editData.email) {
      this.formErrorMessage  = 'Username and Email are required';
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.editData.email)) {
      this.formErrorMessage  = 'Invalid email format. Example: user@example.com';
      return;
    }

    this.authService.updateProfile(this.editData).subscribe({
      next: updatedUser => {
        this.user = updatedUser;
        this.editMode = false;
        this.formErrorMessage  = '';
      },
      error: err => {
        if (err.status === 409 || err.error?.message?.toLowerCase().includes('email')) {
          this.formErrorMessage  = 'Email is already in use.';
        } else {
          this.formErrorMessage  = 'Failed to update account.';
        }
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.errorMessage = '';
  }

  startPasswordUpdate() {
    this.showPasswordForm = true;
    this.errorMessage = '';
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  cancelPasswordUpdate() {
    this.showPasswordForm = false;
    this.errorMessage = '';
  }

  updatePassword() {
    this.formErrorMessage = '';
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.formErrorMessage = 'All password fields are required';
      return;
    }
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.formErrorMessage = 'New password and confirm password do not match';
      return;
    }
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordPattern.test(this.passwordData.newPassword)) {
      this.formErrorMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
      return;
    }

    this.authService.updatePassword(this.passwordData).subscribe({
      next: () => {
        alert('Password updated successfully');
        this.showPasswordForm = false;
        this.formErrorMessage = '';
      },
      error: err => {
        if (err.status === 400 || err.error?.message?.toLowerCase().includes('current password')) {
          this.formErrorMessage = 'Current password is incorrect.';
        } else {
          this.formErrorMessage = 'Failed to update password.';
        }
      }
    });
  }

  showDeleteConfirm = false;

deleteAccount() {
  this.showDeleteConfirm = true; // Show the modal popup instead of browser confirm
}

confirmDeleteAccount() {
  this.authService.deleteAccount().subscribe({
    next: () => {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/']);
      });
    },
    error: () => this.errorMessage = 'Account deletion failed.'
  });
  this.showDeleteConfirm = false;
}

cancelDeleteAccount() {
  this.showDeleteConfirm = false;
}

}
