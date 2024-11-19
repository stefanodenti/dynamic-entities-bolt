import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { DynamicEntity, FieldDefinition } from '../../models/dynamic-entity.model';
import { DynamicEntityService } from '../../services/dynamic-entity.service';
import { EntityPreviewComponent } from '../entity-preview/entity-preview.component';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, EntityPreviewComponent],
  template: `
    <div class="p-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Available Fields -->
        <div class="lg:col-span-3">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Field Types</h2>
              <div
                cdkDropList
                #availableList="cdkDropList"
                [cdkDropListData]="availableFields"
                [cdkDropListConnectedTo]="[entityList]"
                class="min-h-[200px] bg-base-200 rounded-lg p-4 space-y-3">
                <div
                  *ngFor="let field of availableFields"
                  cdkDrag
                  [cdkDragData]="field"
                  class="card bg-primary hover:bg-primary-focus cursor-move transition-colors">
                  <div class="card-body p-4">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-grip-vertical text-primary-content/50"></i>
                      <span class="text-primary-content font-medium capitalize">{{field.type}} Field</span>
                    </div>
                    <div class="text-xs text-primary-content/70">Drag to add</div>
                  </div>
                  <!-- Preview when dragging -->
                  <div *cdkDragPreview class="card bg-primary">
                    <div class="card-body p-4">
                      <span class="text-primary-content font-medium capitalize">{{field.type}} Field</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="lg:col-span-5">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title mb-4">Create Dynamic Entity</h2>
              
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text font-medium">Entity Name</span>
                </label>
                <input 
                  type="text" 
                  [(ngModel)]="entity.name" 
                  class="input input-bordered w-full" 
                  placeholder="Enter entity name"
                />
              </div>

              <div class="divider">Entity Fields</div>

              <div
                cdkDropList
                #entityList="cdkDropList"
                [cdkDropListData]="entity.fields"
                [cdkDropListConnectedTo]="[availableList]"
                (cdkDropListDropped)="drop($event)"
                class="min-h-[300px] bg-base-200 rounded-lg p-4 space-y-3">
                
                <div *ngIf="entity.fields.length === 0" 
                     class="text-center py-8 text-base-content/50">
                  Drag fields here to build your entity
                </div>

                <div
                  *ngFor="let field of entity.fields; let i = index"
                  cdkDrag
                  class="card bg-secondary hover:bg-secondary-focus transition-colors">
                  <div class="card-body p-4">
                    <div class="flex items-center gap-4">
                      <i class="fas fa-grip-vertical text-secondary-content/50 cursor-move" cdkDragHandle></i>
                      <div class="form-control flex-1">
                        <input 
                          type="text" 
                          [(ngModel)]="field.name" 
                          class="input input-sm bg-secondary-focus text-secondary-content placeholder-secondary-content/50" 
                          [placeholder]="'Enter ' + field.type + ' field name'"
                        />
                      </div>
                      <label class="label cursor-pointer gap-2">
                        <span class="label-text text-secondary-content">Required</span>
                        <input 
                          type="checkbox" 
                          [(ngModel)]="field.required" 
                          class="checkbox checkbox-accent checkbox-sm"
                        />
                      </label>
                      <button 
                        class="btn btn-circle btn-ghost btn-sm text-secondary-content"
                        (click)="removeField(i)">
                        ×
                      </button>
                    </div>
                    <div class="text-xs text-secondary-content/70 mt-1">
                      Type: {{field.type}}
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-actions justify-end mt-6">
                <button 
                  class="btn btn-success"
                  (click)="saveEntity()"
                  [disabled]="!entity.name || entity.fields.length === 0">
                  <i class="fas fa-save mr-2"></i>
                  Save Entity
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="lg:col-span-4">
          <app-entity-preview [entity]="entity"></app-entity-preview>
        </div>
      </div>
    </div>
  `
})
export class EntityFormComponent {
  availableFields: FieldDefinition[] = [
    { name: '', type: 'string', required: false },
    { name: '', type: 'number', required: false },
    { name: '', type: 'date', required: false },
    { name: '', type: 'array', required: false }
  ];

  entity: DynamicEntity = {
    name: '',
    fields: []
  };

  constructor(private entityService: DynamicEntityService) {}

  drop(event: CdkDragDrop<FieldDefinition[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Create a new field based on the dragged template
      const draggedField = event.previousContainer.data[event.previousIndex];
      const newField: FieldDefinition = {
        name: '',
        type: draggedField.type,
        required: false
      };
      
      // Insert the new field at the drop position
      copyArrayItem(
        [newField],
        event.container.data,
        0,
        event.currentIndex
      );
    }
  }

  removeField(index: number) {
    this.entity.fields.splice(index, 1);
  }

  saveEntity() {
    if (this.validateEntity()) {
      this.entityService.createEntity(this.entity).subscribe({
        next: (result) => {
          console.log('Entity created:', result);
          this.resetForm();
        },
        error: (error) => console.error('Error creating entity:', error)
      });
    }
  }

  private validateEntity(): boolean {
    if (!this.entity.name.trim()) {
      alert('Entity name is required');
      return false;
    }
    if (this.entity.fields.length === 0) {
      alert('At least one field is required');
      return false;
    }
    if (this.entity.fields.some(f => !f.name.trim())) {
      alert('All fields must have a name');
      return false;
    }
    return true;
  }

  private resetForm() {
    this.entity = {
      name: '',
      fields: []
    };
  }
}