import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ Added CommonModule and RouterModule
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'admin';
  }

  isEmployee(): boolean {
    return localStorage.getItem('role') === 'employee';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
