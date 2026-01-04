/**
 * DEPRECATED: Legacy convenio form configurations
 * 
 * This file previously contained hardcoded form configurations for:
 * - ConvenioMarcoForm
 * - ConvenioPracticaMarcoForm
 * - ConvenioEspecificoForm
 * - ConvenioParticularForm
 * - AcuerdoColaboracionForm
 * 
 * These have been replaced by the DYNAMIC FORM SYSTEM:
 * - Admin uploads a .docx template
 * - System extracts {{placeholders}} automatically
 * - Forms are generated dynamically via DynamicConvenioPage
 * 
 * See: src/features/agreements/components/forms/dynamic/DynamicConvenioPage.tsx
 */

// EMPTY: All forms are now dynamic
// This object is kept for backward compatibility during transition
export const convenioConfigs: Record<string, never> = {};
