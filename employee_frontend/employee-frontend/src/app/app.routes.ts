import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MarkAttendanceComponent } from './components/mark-attendance/mark-attendance.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'mark-attendance', component: MarkAttendanceComponent, canActivate: [AuthGuard] },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
