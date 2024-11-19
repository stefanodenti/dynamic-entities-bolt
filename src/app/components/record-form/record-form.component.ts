import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicEntity, DynamicRecord } from '../../models/dynamic-entity.model';

@Component({
  selector: 'app-record-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        {{record?._id ? 'Edit' : 'Add'}} Record
      </h3>
      
      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="space-y-4">
          <div *ngFor="let field of entity.fields" class="form-control w-full">
            <label class="label">
              <span class="label-text">{{field.name}}</span>
              <span class="label-text-alt" *ngIf="field.required">Required</span>
            </label>
            
            <ng-container [ngSwitch]="field.type">
              <!-- String Input -->
              <input *ngSwitchCase="'string'"
                type="text"
                class="input input-bordered w-full"
                [name]="field.name"
                [(ngModel)]="formData[field.name]"
                [required]="field.required"
              />
              
              <!-- Number Input -->
              <input *ngSwitchCase="'number'"
                type="number"
                class="input input-bordered w-full"
                [name]="field.name"
                [(ngModel)]="formData[field.name]"
                [required]="field.required"
              />
              
              <!-- Date Input -->
              <input *ngSwitchCase="'date'"
                type="date"
                class="input input-bordered w-full"
                [name]="field.name"
                [(ngModel)]="formData[field.name]"
                [required]="field.required"
              />
              
              <!-- Array Input -->
              <div *ngSwitchCase="'array'" class="space-y-2">
                <div *ngFor="let item of getArrayItems(field.name); let i = index" 
                     class="flex gap-2">
                  <input
                    type="text"
                    class="input input-bordered flex-1"
                    [(ngModel)]="formData[field.name][i]"
                    [name]="field.name + '_' + i"
                  />
                  <button type="button" 
                          class="btn btn-square btn-error btn-sm"
                          (click)="removeArrayItem(field.name, i)">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button type="button" 
                        class="btn btn-sm btn-outline w-full"
                        (click)="addArrayItem(field.name)">
                  <i class="fas fa-plus mr-2"></i> Add Item
                </button>
              </div>
            </ng-container>
          </div>
        </div>
        
        <div class="modal-action">
          <button type="button" class="btn" (click)="onCancel()">Cancel</button>
          <button type="submit" 
                  class="btn btn-primary" 
                  [disabled]="!form.valid">
            {{record?._id ? 'Update' : 'Create'}}
          </button>
        </div>
      </form>
    </div>
  `
})
export class RecordFormComponent implements OnInit {
  @Input() entity!: DynamicEntity;
  @Input() record?: DynamicRecord;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  formData: any = {};

  ngOnInit() {
    this.initializeFormData();
  }

  private initializeFormData() {
    this.formData = {};
    if (this.record) {
      // Edit mode - populate with existing data
      this.entity.fields.forEach(field => {
        this.formData[field.name] = this.record![field.name];
      });
    } else {
      // Create mode - initialize empty values
      this.entity.fields.forEach(field => {
        this.formData[field.name] = field.type === 'array' ? [] : '';
      });
    }
  }

  getArrayItems(fieldName: string): any[] {
    return this.formData[fieldName] || [];
  }

  addArrayItem(fieldName: string) {
    if (!this.formData[fieldName]) {
      this.formData[fieldName] = [];
    }
    this.formData[fieldName].push('');
  }

  removeArrayItem(fieldName: string, index: number) {
    this.formData[fieldName].splice(index, 1);
  }

  onSubmit() {
    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }
}