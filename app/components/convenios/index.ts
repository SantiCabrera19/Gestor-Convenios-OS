// Backward compatibility re-exports
// TODO: Remove after Stage 5 when all imports are updated

// Moved to features/agreements (Stage 4A - core)
export { convenioConfigs } from '@/features/agreements/components/core/convenio-configs';
export { ConvenioHeader } from '@/features/agreements/components/core/convenio-header';
export { NavigationFooter } from '@/features/agreements/components/core/navigation-footer';
export { FullScreenPreview } from '@/features/agreements/components/core/full-screen-preview';

// Moved to features/agreements (Stage 4B2 - layout)
export { ConvenioFormLayout } from '@/features/agreements/components/layout/ConvenioFormLayout';
export { ConvenioInfoDisplay } from '@/features/agreements/components/layout/convenio-info-display';
export { DocumentoPreview } from '@/features/agreements/components/layout/documento-preview';
export { default as DocumentoPreviewContent } from '@/features/agreements/components/layout/documento-preview-content';

