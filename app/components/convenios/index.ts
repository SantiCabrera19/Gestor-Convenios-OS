// Backward compatibility re-exports
// TODO: Remove after Stage 5 when all imports are updated

// Moved to features/agreements (Stage 4A)
export { convenioConfigs } from '@/features/agreements/components/core/convenio-configs';
export { ConvenioHeader } from '@/features/agreements/components/core/convenio-header';
export { NavigationFooter } from '@/features/agreements/components/core/navigation-footer';
export { FullScreenPreview } from '@/features/agreements/components/core/full-screen-preview';

// Still in this folder (Stage 4B will move these)
export { ConvenioFormLayout } from './ConvenioFormLayout';
export { ConvenioInfoDisplay } from './convenio-info-display';
export { DocumentoPreview } from './documento-preview';
export { DocumentoPreviewContent } from './documento-preview-content';
