import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CalendarComponent } from './components/dashboard/calendar/calendar'; // adjust path
import { ProfileComponent } from './components/dashboard/profile/profile';

export const routes: Routes = [
  { path: '', component: HomepageComponent },  // Default page
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard/calendar', component: CalendarComponent },
  { path: 'dashboard/profile', component: ProfileComponent }, 
  { path: 'dashboard', component: DashboardComponent }
];
