import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and Password are required.';
      return;
    }

    const credentials = { username: this.username, password: this.password };

    this.http.post<any>('http://localhost:3000/api/login', credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);

        // ✅ Save the employee_id in localStorage
        localStorage.setItem('employee_id', response.employee_id.toString());

        // Navigate based on role
        if (response.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/mark-attendance']);
        }
      },
      error: () => {
        this.errorMessage = 'Invalid username or password.';
      }
    });
  }
}
