import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { List } from '../models/list.model';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = 'http://localhost:3000/api/lists';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getLists(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createList(list: any): Observable<any> {
    return this.http.post(this.apiUrl, list, { headers: this.getAuthHeaders() });
  }

  updateListContent(id: string, content: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/content`, { content }, { headers: this.getAuthHeaders() });
  }

  updateListShare(id: string, share: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/share`, { share }, { headers: this.getAuthHeaders() });
  }

  updateListShareNo(id: string, share: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/shareNo`, { share });
  }

  deleteList(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  notifyChanges(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/notify`, {}, { headers: this.getAuthHeaders() });
  }
}