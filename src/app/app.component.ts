import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { EntityFormComponent } from './components/entity-form/entity-form.component';
import { EntityViewComponent } from './components/entity-view/entity-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    EntityFormComponent,
    EntityViewComponent
  ],
  template: `
    <div class="container mx-auto py-8">
      <h1 class="text-4xl font-bold mb-8 text-center">Dynamic Entities Manager</h1>
      
      <div class="tabs tabs-boxed mb-8 flex justify-center">
        <a 
          class="tab" 
          [class.tab-active]="activeTab === 'configure'"
          (click)="activeTab = 'configure'"
        >
          Configure Entities
        </a>
        <a 
          class="tab" 
          [class.tab-active]="activeTab === 'manage'"
          (click)="activeTab = 'manage'"
        >
          Manage Records
        </a>
      </div>

      <app-entity-form *ngIf="activeTab === 'configure'"></app-entity-form>
      <app-entity-view *ngIf="activeTab === 'manage'"></app-entity-view>
    </div>
  `
})
export class App {
  activeTab: 'configure' | 'manage' = 'configure';
}