# Refactor Audit Report - Pre-Stage 5

**Fecha:** 2025-12-15  
**Rama:** `refactor/architecture-v2`  
**Estado del Build:** ✅ PASS (33 páginas compiladas)

---

## 1. Contexto y Objetivo del Refactor

El objetivo fue reestructurar el repositorio NexusDoc hacia una arquitectura modular estilo Next.js App Router 2025, organizando el código en tres capas principales: `features/` (lógica de dominio), `shared/` (componentes y utilidades reutilizables), e `infrastructure/` (integraciones externas). Se ejecutaron 7 etapas incrementales (0, 1, 2, 3, 4A, 4B1, 4B2) manteniendo la app funcional en cada paso.

---

## 2. Estado Actual del Árbol de Carpetas

### Nueva Arquitectura (`src/`)

```
src/
├── features/
│   ├── agreements/        (17 archivos - convenios)
│   │   ├── components/
│   │   │   ├── core/      (4 archivos)
│   │   │   ├── forms/     (3 + dynamic/3 archivos)
│   │   │   ├── cards/     (2 archivos)
│   │   │   └── layout/    (4 archivos)
│   │   └── index.ts
│   └── templates/         (5 archivos - plantillas admin)
│       ├── components/    (4 archivos)
│       └── index.ts
├── shared/
│   ├── components/ui/     (34 componentes)
│   ├── dashboard/         (5 archivos)
│   ├── services/          (3 archivos)
│   ├── storage/           (4 archivos)
│   ├── types/             (6 archivos)
│   └── utils/             (8 archivos)
└── infrastructure/
    ├── supabase/          (3 archivos)
    └── google-drive/      (1 archivo)
```

### `app/` (Routing + Wiring)

```
app/
├── (routes)               # Páginas Next.js - NO SE TOCARON
├── api/                   # API Routes - imports actualizados
├── components/            # Compat layers + legacy forms
│   ├── convenios/index.ts # COMPAT: re-exports a features
│   ├── forms/index.ts     # COMPAT: re-exports a features
│   ├── dashboard/index.ts # COMPAT: re-exports a features
│   ├── admin/index.ts     # COMPAT: re-exports a features
│   └── forms/convenio-*/  # LEGACY: NO MOVIDOS (4C pendiente)
└── lib/                   # LEGACY: parcialmente migrado
```

### Legacy Folders (Pendientes de Eliminación)

| Folder | Estado | Archivos |
|--------|--------|----------|
| `lib/` | ⚠️ Parcialmente vacío | services (1), storage (4), types (6), utils (1) |
| `utils/` | ⚠️ Legacy | supabase (3), template-analyzer.ts, utils.ts |
| `components/` (root) | ⚠️ Legacy | header-auth.tsx, tutorial/*, etc. |
| `app/lib/` | ⚠️ Parcialmente migrado | dashboard/, google-drive.ts duplicados |
| `app/components/forms/convenio-*/` | ⚠️ No movidos | 5 subdirs con forms específicos |

---

## 3. Auditoría por Etapa

### Stage 0: Setup Aliases

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Configurar path aliases y crear estructura base |
| **Realizado** | ✅ `tsconfig.json` actualizado con `@/features/*`, `@/shared/*`, `@/infrastructure/*` |
| **Validación** | Build PASS, 7 errores pre-existentes corregidos |
| **Deuda** | Ninguna |

---

### Stage 1: Consolidar UI Components

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover 34 componentes UI a `src/shared/components/ui/` |
| **Realizado** | ✅ 34 archivos movidos, imports actualizados |
| **Validación** | Build PASS |
| **Deuda** | `components/` (root) aún existe con archivos legacy |

---

### Stage 2: Consolidar Lib/Services

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover Supabase, Google Drive, utils, types a nuevas ubicaciones |
| **Realizado** | ✅ 30+ archivos migrados a `src/infrastructure/`, `src/shared/` |
| **Validación** | Build PASS, Tests PASS |
| **Deuda** | Archivos originales en `lib/`, `utils/`, `app/lib/` NO eliminados |

---

### Stage 3: Migrar Feature Templates

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover 4 componentes de plantillas a `src/features/templates/` |
| **Realizado** | ✅ FieldEditor, TemplateWizard, SchemaEditor, TemplateManagerClient |
| **Validación** | Build PASS |
| **Deuda** | Compat layer en `app/components/admin/index.ts` |

---

### Stage 4A: Core Agreement Components

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover 9 componentes core de agreements |
| **Realizado** | ✅ 4 core, 3 forms base, 2 cards movidos |
| **Validación** | Build PASS, Tests PASS |
| **Deuda** | Compat layers en convenios/, forms/, dashboard/index.ts |

---

### Stage 4B1: Dynamic Forms

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover 3 archivos dynamic forms |
| **Realizado** | ✅ DynamicConvenioPage, DynamicField, DynamicFormRenderer |
| **Validación** | Build PASS, Tests PASS |
| **Deuda** | Ninguna adicional |

---

### Stage 4B2: Layout Components

| Aspecto | Detalle |
|---------|---------|
| **Objetivo** | Mover 4 archivos layout/display |
| **Realizado** | ✅ ConvenioFormLayout, convenio-info-display, documento-preview* |
| **Validación** | Build PASS, Tests PASS |
| **Deuda** | Cross-dependency full-screen-preview→layout actualizada |

---

## 4. Verificación de Coherencia Arquitectónica

| Check | Estado | Explicación |
|-------|--------|-------------|
| `app/` actúa como routing/wiring | ✅ SÍ | Páginas solo importan desde compat layers o features |
| Duplicaciones UI resueltas | ✅ SÍ | 34 componentes en `src/shared/components/ui/` |
| Duplicaciones lib/utils/types | ⚠️ PARCIAL | Archivos migrados a `src/shared/`, pero originales NO eliminados |
| Aliases `@/features`, `@/shared`, `@/infrastructure` usados | ✅ SÍ | Nuevos archivos usan aliases correctamente |
| Compat layers presentes | ✅ SÍ | 4 index.ts en app/components/* |

### Compat Layers Activos

| Archivo | Propósito |
|---------|-----------|
| `app/components/convenios/index.ts` | Re-exports de 8 componentes → features/agreements |
| `app/components/forms/index.ts` | Re-exports de 5 componentes → features/agreements |
| `app/components/dashboard/index.ts` | Re-exports de 2 cards + 4 genéricos |
| `app/components/admin/index.ts` | Re-exports de 2 componentes → features/templates |

---

## 5. Análisis de Imports Legacy (MÉTRICAS)

### Conteo por Patrón

| Patrón | Referencias | Criticidad |
|--------|-------------|------------|
| `@/lib/` | 5 | ⚠️ Media |
| `@/utils/` | 2 | 🔴 Alta (archivos legacy) |
| `@/app/lib/` | 3 | ⚠️ Media |
| `@/app/components/` | 20+ | ✅ OK (via compat layers) |
| `@/components/` | 1 | 🟡 Baja (layout.tsx) |

### Top 10 Archivos con Imports Legacy

| # | Archivo | Import Legacy |
|---|---------|---------------|
| 1 | `src/shared/dashboard/get-user-convenios.ts` | `@/lib/types/dynamic-form` |
| 2 | `src/shared/services/document-generator.ts` | `@/lib/storage/providers` |
| 3 | `lib/services/document-generator.ts` | `@/lib/storage/providers` (DUPLICADO) |
| 4 | `app/lib/dashboard/get-user-convenios.ts` | `@/lib/types/dynamic-form` (DUPLICADO) |
| 5 | `app/api/convenios/route.ts` | `@/lib/types/dynamic-form` |
| 6 | `app/api/convenios/[id]/route.ts` | `@/app/lib/services/email-service` |
| 7 | `app/api/admin/convenios/[id]/notify/route.ts` | `@/app/lib/services/email-service` |
| 8 | `app/api/admin/convenios/[id]/actions/route.ts` | `@/app/lib/services/email-service` |
| 9 | `components/tutorial/fetch-data-steps.tsx` | `@/utils/supabase/server` |
| 10 | `app/api/convenio-types/[id]/route.ts` | `@/utils/supabase/server` |

### Clasificación

| Tipo | Cantidad | Acción |
|------|----------|--------|
| **Compat Layer OK** | ~20 | Mantener hasta Stage 5 final |
| **Deuda Real** | ~10 | Actualizar en Stage 5 |
| **Duplicados** | 4 | Eliminar originales en Stage 5 |

---

## 6. Checklist Go/No-Go para Stage 5

### ✅ GO si:

- [x] Build pasa (33 páginas)
- [x] Tests pasan (2 test files)
- [x] Type checking OK
- [x] Linting OK
- [x] Compat layers funcionando
- [x] Ningún import roto

### ❌ NO-GO si:

- [ ] Página crítica falla en runtime
- [ ] Import cycle detectado
- [ ] Tests con estado failing

### Riesgos de Cleanup

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Eliminar `lib/` antes de actualizar 10 imports | 🔴 Build Fail | Actualizar imports ANTES de eliminar |
| Eliminar `utils/` con imports activos | 🔴 Build Fail | Redirigir `@/utils/supabase` → `@/infrastructure/supabase` |
| Eliminar archivos duplicados sin verificar | ⚠️ Runtime errors | Verificar que solo se usan los migrados |

---

## 7. Recomendación Final

### ✅ ESTAMOS LISTOS PARA STAGE 5 (con precauciones)

**Orden de eliminación recomendado:**

1. **Fase 5A: Actualizar imports legacy restantes (~10 archivos)**
   - Cambiar `@/lib/types/*` → `@/shared/types/*`
   - Cambiar `@/lib/storage/*` → `@/shared/storage/*`
   - Cambiar `@/utils/supabase/*` → `@/infrastructure/supabase/*`
   - Cambiar `@/app/lib/services/*` → `@/shared/services/*`

2. **Fase 5B: Eliminar carpetas legacy**
   - `lib/` (después de 5A)
   - `utils/` (después de 5A)
   - `app/lib/` archivos duplicados

3. **Fase 5C: Eliminar archivos vacíos/obsoletos**
   - `.gitkeep` files si ya no son necesarios
   - Archivos duplicados en `components/` root

4. **Fase 5D: Opcional - Mover forms/convenio-*** (4C)
   - Alto acoplamiento, bajo beneficio inmediato
   - Postergar si no hay tiempo

### Acciones Inmediatas (antes de Stage 5)

1. ⚠️ **Actualizar 2 imports críticos** en `components/tutorial/` y `app/api/convenio-types/` que usan `@/utils/supabase/server`
2. ⚠️ **Verificar 3 imports** en API routes que usan `@/app/lib/services/email-service`
3. ✅ **Confirmar** que compat layers son suficientes para routing actual

---

## Anexo: Validación Actual

```
npm run build    → Exit code: 0 ✅
npm run test     → 2 test files passed ✅
TypeScript       → No errors ✅
ESLint           → No errors ✅
```
