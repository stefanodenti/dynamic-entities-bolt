import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DynamicEntity, DynamicRecord } from '../models/dynamic-entity.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicEntityService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Entity Configuration endpoints
  createEntity(entity: DynamicEntity): Observable<DynamicEntity> {
    return this.http.post<DynamicEntity>(`${this.apiUrl}/entities`, entity);
  }

  getEntities(): Observable<DynamicEntity[]> {
    return this.http.get<DynamicEntity[]>(`${this.apiUrl}/entities`);
  }

  // Dynamic Records endpoints
  getRecords(entityId: string): Observable<DynamicRecord[]> {
    return this.http.get<DynamicRecord[]>(`${this.apiUrl}/entities/${entityId}/records`);
  }

  createRecord(entityId: string, record: DynamicRecord): Observable<DynamicRecord> {
    return this.http.post<DynamicRecord>(`${this.apiUrl}/entities/${entityId}/records`, record);
  }

  updateRecord(entityId: string, recordId: string, record: DynamicRecord): Observable<DynamicRecord> {
    return this.http.put<DynamicRecord>(`${this.apiUrl}/entities/${entityId}/records/${recordId}`, record);
  }

  deleteRecord(entityId: string, recordId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entities/${entityId}/records/${recordId}`);
  }
}