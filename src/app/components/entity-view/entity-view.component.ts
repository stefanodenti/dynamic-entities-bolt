import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicEntity, DynamicRecord } from '../../models/dynamic-entity.model';
import { DynamicEntityService } from '../../services/dynamic-entity.service';
import { RecordPreviewComponent } from '../record-preview/record-preview.component';
import { RecordFormComponent } from '../record-form/record-form.component';

@Component({
  selector: 'app-entity-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RecordPreviewComponent, RecordFormComponent],
  template: `
    <div class="p-4">
      <div class="flex justify-between mb-4">
        <select 
          [(ngModel)]="selectedEntityId" 
          (ngModelChange)="loadRecords()"
          class="select select-bordered w-full max-w-xs"
        >
          <option value="">Select an entity</option>
          <option *ngFor="let entity of entities" [value]="entity._id">
            {{entity.name}}
          </option>
        </select>

        <div class="flex gap-4">
          <button 
            *ngIf="selectedEntity"
            class="btn btn-primary"
            (click)="openRecordForm()">
            <i class="fas fa-plus mr-2"></i>
            Add Record
          </button>

          <div class="btn-group">
            <button 
              class="btn" 
              [class.btn-active]="viewMode === 'table'"
              (click)="viewMode = 'table'"
            >
              <i class="fas fa-table mr-2"></i>
              Table
            </button>
            <button 
              class="btn" 
              [class.btn-active]="viewMode === 'card'"
              (click)="viewMode = 'card'"
            >
              <i class="fas fa-th-large mr-2"></i>
              Cards
            </button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div *ngIf="viewMode === 'table' && selectedEntity" class="card bg-base-100 shadow-xl">
        <div class="card-body p-0">
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th *ngFor="let field of selectedEntity.fields">{{field.name}}</th>
                  <th class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of records">
                  <td *ngFor="let field of selectedEntity.fields">
                    {{formatFieldValue(record[field.name], field.type)}}
                  </td>
                  <td class="text-right">
                    <button class="btn btn-sm btn-warning mr-2"
                            (click)="openRecordForm(record)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error"
                            (click)="deleteRecord(record)">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="records.length === 0">
                  <td [attr.colspan]="selectedEntity.fields.length + 1" class="text-center py-8">
                    No records found. Add some data to get started.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Card View -->
      <div *ngIf="viewMode === 'card' && selectedEntity" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let record of records">
          <div class="card bg-base-100 shadow-xl">
            <app-record-preview 
              [entity]="selectedEntity" 
              [record]="record"
              mode="view"
            ></app-record-preview>
            <div class="card-actions justify-end p-4 pt-0">
              <button class="btn btn-sm btn-warning mr-2"
                      (click)="openRecordForm(record)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-error"
                      (click)="deleteRecord(record)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="records.length === 0" class="col-span-full">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body text-center py-8">
              <h3 class="font-semibold text-lg mb-2">No Records Found</h3>
              <p class="text-base-content/70">Add some data to get started.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Record Form -->
    <dialog id="record_modal" class="modal">
      <div class="modal-backdrop" (click)="closeRecordForm()"></div>
      <app-record-form
        *ngIf="showRecordForm"
        [entity]="selectedEntity!"
        [record]="selectedRecord"
        (save)="saveRecord($event)"
        (cancel)="closeRecordForm()"
      ></app-record-form>
    </dialog>
  `
})
export class EntityViewComponent implements OnInit {
  entities: DynamicEntity[] = [];
  selectedEntityId: string = '';
  selectedEntity?: DynamicEntity;
  records: DynamicRecord[] = [];
  viewMode: 'table' | 'card' = 'table';
  
  // Form state
  showRecordForm = false;
  selectedRecord?: DynamicRecord;

  constructor(private entityService: DynamicEntityService) {}

  ngOnInit() {
    this.loadEntities();
  }

  loadEntities() {
    this.entityService.getEntities().subscribe({
      next: (entities) => {
        this.entities = entities;
      },
      error: (error) => console.error('Error loading entities:', error)
    });
  }

  loadRecords() {
    if (!this.selectedEntityId) return;
    
    this.selectedEntity = this.entities.find(e => e._id === this.selectedEntityId);
    
    this.entityService.getRecords(this.selectedEntityId).subscribe({
      next: (records) => {
        this.records = records;
      },
      error: (error) => console.error('Error loading records:', error)
    });
  }

  formatFieldValue(value: any, type: string): string {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'array':
        return Array.isArray(value) ? value.join(', ') : value;
      default:
        return value.toString();
    }
  }

  openRecordForm(record?: DynamicRecord) {
    this.selectedRecord = record;
    this.showRecordForm = true;
    (document.getElementById('record_modal') as HTMLDialogElement).showModal();
  }

  closeRecordForm() {
    this.showRecordForm = false;
    this.selectedRecord = undefined;
    (document.getElementById('record_modal') as HTMLDialogElement).close();
  }

  saveRecord(formData: any) {
    if (!this.selectedEntityId) return;

    const saveOperation = this.selectedRecord?._id
      ? this.entityService.updateRecord(this.selectedEntityId, this.selectedRecord._id, formData)
      : this.entityService.createRecord(this.selectedEntityId, formData);

    saveOperation.subscribe({
      next: () => {
        this.loadRecords();
        this.closeRecordForm();
      },
      error: (error) => console.error('Error saving record:', error)
    });
  }

  deleteRecord(record: DynamicRecord) {
    if (!this.selectedEntityId || !record._id) return;

    if (confirm('Are you sure you want to delete this record?')) {
      this.entityService.deleteRecord(this.selectedEntityId, record._id).subscribe({
        next: () => {
          this.loadRecords();
        },
        error: (error) => console.error('Error deleting record:', error)
      });
    }
  }
}