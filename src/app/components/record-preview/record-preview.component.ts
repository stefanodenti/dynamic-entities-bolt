import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicEntity, DynamicRecord } from '../../models/dynamic-entity.model';

@Component({
  selector: 'app-record-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-body p-4">
      <div class="grid grid-cols-2 gap-4">
        <div *ngFor="let field of entity.fields" class="space-y-1">
          <label class="text-sm font-medium opacity-70">{{field.name}}</label>
          <div class="p-2 bg-base-200 rounded text-sm">
            {{record ? formatValue(record[field.name], field.type) : getSampleValue(field.type)}}
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecordPreviewComponent {
  @Input() entity!: DynamicEntity;
  @Input() record?: DynamicRecord;
  @Input() mode: 'preview' | 'view' = 'preview';

  getSampleValue(type: string): any {
    switch (type) {
      case 'string':
        return 'Sample Text';
      case 'number':
        return 42;
      case 'date':
        return new Date().toLocaleDateString();
      case 'array':
        return ['item1', 'item2'].join(', ');
      default:
        return '';
    }
  }

  formatValue(value: any, type: string): string {
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
}