import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicEntity } from '../../models/dynamic-entity.model';
import { RecordPreviewComponent } from '../record-preview/record-preview.component';

@Component({
  selector: 'app-entity-preview',
  standalone: true,
  imports: [CommonModule, RecordPreviewComponent],
  template: `
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h3 class="card-title text-lg">Structure Preview</h3>
        <div class="mockup-code bg-primary text-primary-content p-4">
          <pre><code>{{getEntityStructure()}}</code></pre>
        </div>
        
        <div class="mt-6">
          <h4 class="font-semibold mb-3">Sample Record:</h4>
          <app-record-preview [entity]="entity"></app-record-preview>
        </div>
      </div>
    </div>
  `,
})
export class EntityPreviewComponent {
  @Input() entity!: DynamicEntity;

  getEntityStructure(): string {
    return JSON.stringify({
      name: this.entity.name || 'entityName',
      fields: this.entity.fields.map(field => ({
        name: field.name,
        type: field.type,
        required: field.required
      }))
    }, null, 2);
  }
}