export type FieldType = 'text' | 'number' | 'date' | 'select' | 'dependent-select' | 'textarea' | 'email' | 'checkbox';

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
  required?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // Para selects simples
  dependsOn?: string; // Para selects dependientes (ej: dia depende de mes)
  transform?: 'uppercase' | 'lowercase';
  validation?: ValidationRule;
  defaultValue?: any;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: string; // Nombre del icono (ej: "BuildingIcon")
  fields: FormField[];
}

export interface FormSchema {
  steps: FormStep[];
}

export interface FormDefinition {
  id: number;
  convenio_type_id: number;
  version: number;
  active: boolean;
  schema: FormSchema;
}
