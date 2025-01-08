import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  logout(): void {
    this.cookieService.delete('token');
    this.router.navigate(['/']);
  }

  isLoggedIn(): boolean {
    return this.cookieService.check('token');
  }

  getToken(): string | null {
    return this.cookieService.get('token');
  }

  setToken(token: string): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Expira en 7 días
    this.cookieService.set('token', token, expirationDate);
  }

  getUsername(): string {
    // Suponiendo que el nombre de usuario está almacenado en el token JWT
    const token = this.getToken();
    if (!token) return 'ERROR: No token found';

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, { headers: this.getAuthHeaders() });
  }

  forgotPassword(username: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { username });
  }

  upgradeToPremium(): Observable<any> {
    return this.http.post(`${this.apiUrl}/upgrade-to-premium`, {}, { headers: this.getAuthHeaders() });
  }
}