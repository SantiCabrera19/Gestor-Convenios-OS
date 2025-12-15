// Backward compatibility re-exports  
// TODO: Remove after Stage 5 when all imports are updated
export { DynamicFormRenderer } from '@/features/agreements/components/forms/DynamicFormRenderer';
export { HorizontalStepper } from '@/features/agreements/components/forms/HorizontalStepper';
export { StepIndicator } from '@/features/agreements/components/forms/StepIndicator';

// Dynamic forms (moved in 4B1) - NOT exporting DynamicFormRenderer to avoid name conflict
export { DynamicConvenioPage } from '@/features/agreements/components/forms/dynamic/DynamicConvenioPage';
export { DynamicField } from '@/features/agreements/components/forms/dynamic/DynamicField';
