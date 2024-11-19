export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'array';
  required?: boolean;
}

export interface DynamicEntity {
  _id?: string;
  name: string;
  fields: FieldDefinition[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DynamicRecord {
  _id?: string;
  entityId: string;
  [key: string]: any;
}