import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-mark-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mark-attendance.component.html',
  styleUrls: ['./mark-attendance.component.css']
})
export class MarkAttendanceComponent {
  statusMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  private isTokenValid(token: string): boolean {
    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  markPresent() {
    const employeeId = localStorage.getItem('employee_id');
    const token = localStorage.getItem('token');

    console.log('Employee ID:', employeeId);
    console.log('Token:', token);

    if (!employeeId || !token || !this.isTokenValid(token)) {
      console.error('Authentication failed. Invalid token or employee ID.');
      this.statusMessage = '❌ Authentication failed. Invalid token or employee ID.';
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/api/attendance', {
      employee_id: parseInt(employeeId),
      status: 'Present'
    }, { headers }).subscribe({
      next: () => {
        this.statusMessage = '✅ Attendance marked successfully!';
      },
      error: (error) => {
        if (error.status === 409) {
          this.statusMessage = '⚠️ Attendance already marked for today!';
        } else if (error.status === 401 || error.status === 403) {
          this.statusMessage = '❌ Authentication error. Please login again.';
        } else {
          console.error('Error marking attendance:', error);
          this.statusMessage = '❌ Failed to mark attendance. Please try again.';
        }
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
