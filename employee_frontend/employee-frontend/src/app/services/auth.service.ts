import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private router: Router) {}

  // Login API
  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password });
  }

  // Save token
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Get token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
