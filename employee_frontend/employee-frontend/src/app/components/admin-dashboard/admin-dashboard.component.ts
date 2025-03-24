import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  selectedSection = 'dashboard';
  attendanceRecords: any[] = [];
  employees: any[] = [];
  message = '';
  error = '';

  // Attendance Summary (Fixed Missing Property)
  attendanceSummary: { [key: string]: { present: number; absent: number } } = {};

  // New Employee Form Model
  newEmployee = {
    username: '',
    password: '',
    role: 'employee',
    name: '',
    department: '',
    email: ''
  };

  // Pie Chart Properties
  pieChartLabels: string[] = [];
  pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  // Bar Chart Properties
  barChartLabels: string[] = [];
  barChartData: ChartData<'bar', number[], string> = {
    labels: [],
    datasets: [{ data: [], label: 'Present Count' }]
  };
  barChartType: ChartType = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchAttendanceRecords();
    this.fetchEmployees();
    this.loadDepartmentData();
    this.loadBarChartData();
  }

  // Section Selection
  selectSection(section: string) {
    this.selectedSection = section;
    if (section === 'attendance') {
      this.fetchAttendanceRecords();
    } else if (section === 'users') {
      this.fetchEmployees();
    }
  }

  fetchAttendanceRecords() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<any[]>('http://localhost:3000/api/attendance', { headers }).subscribe({
      next: (data) => {
        this.attendanceRecords = data;
      },
      error: (error) => console.error('Error fetching attendance records:', error)
    });
  }

  

  // Fetch Employees
  fetchEmployees() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:3000/api/employees', { headers }).subscribe({
      next: (data) => this.employees = data,
      error: (error) => console.error('Error fetching employees:', error)
    });
  }

  // Add New Employee
  addEmployee() {
    const { username, password, role, name, department, email } = this.newEmployee;
    if (!username || !password || !role || !name || !department || !email) {
      this.error = 'All fields are required!';
      this.message = '';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/api/employees', this.newEmployee, { headers }).subscribe({
      next: () => {
        this.message = 'Employee added successfully!';
        this.error = '';
        this.fetchEmployees(); // Refresh list after adding
        this.loadDepartmentData(); // Refresh chart
        this.newEmployee = { username: '', password: '', role: 'employee', name: '', department: '', email: '' };
      },
      error: () => {
        this.message = '';
        this.error = 'Failed to add employee.';
      }
    });
  }

  // Delete Employee
  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.delete(`http://localhost:3000/api/employees/${id}`, { headers }).subscribe({
        next: () => {
          this.message = 'Employee deleted successfully!';
          this.error = '';
          this.fetchEmployees(); // Refresh list after deletion
          this.loadDepartmentData(); // Refresh chart
        },
        error: () => {
          this.message = '';
          this.error = 'Failed to delete employee.';
        }
      });
    }
  }

  // Load Department Data for Pie Chart
  loadDepartmentData() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:3000/api/attendance/department-counts', { headers }).subscribe({
      next: (data) => {
        this.pieChartLabels = data.map(item => item.department);
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{ data: data.map(item => item.count) }]
        };
      },
      error: (error) => console.error('Error fetching department counts:', error)
    });
  }

  loadBarChartData() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any[]>('http://localhost:3000/api/attendance/department-attendance', { headers }).subscribe({
      next: (data) => {
        this.barChartLabels = data.map(item => item.department);
        this.barChartData = {
          labels: this.barChartLabels,
          datasets: [{ data: data.map(item => item.present_count), label: 'Present Count' }]
        };
      },
      error: (error) => console.error('Error fetching department attendance:', error)
    });
  }


  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
