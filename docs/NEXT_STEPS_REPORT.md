# Next Steps Report: Stage 5C vs 4C Decision

**Date:** 2025-12-15  
**Status:** Post Stage 5B (Legacy folders removed)

---

## 1. Current Inventory

### Compat Layers (still active)

| File | Status | Purpose |
|------|--------|---------|
| `app/components/convenios/index.ts` | ✅ Active | Re-exports 8 components → features/agreements |
| `app/components/forms/index.ts` | ✅ Active | Re-exports 5 components → features/agreements |
| `app/components/dashboard/index.ts` | ✅ Active | Re-exports 6 components → features/agreements + dashboard |
| `app/components/admin/index.ts` | ⚠️ Unused | 0 imports detected, can delete immediately |

### Legacy Root (`components/`)

| File/Dir | Used? | Notes |
|----------|-------|-------|
| `header-auth.tsx` | ✅ Yes | Used in `app/layout.tsx` |
| `theme-switcher.tsx` | ✅ Yes | Used in header |
| `form-message.tsx` | ✅ Yes | Auth forms |
| `submit-button.tsx` | ✅ Yes | Auth forms |
| `tutorial/` (5 files) | ⚠️ Maybe | Supabase starter template content |
| `hero.tsx` | ⚠️ Maybe | Landing page |
| `deploy-button.tsx` | ❌ No | Starter template cruft |
| `next-logo.tsx` | ❌ No | Starter template cruft |
| `supabase-logo.tsx` | ❌ No | Starter template cruft |
| `env-var-warning.tsx` | ❌ No | Dev-only |
| `typography/` | ❌ No | Unused |

### Forms Pendientes (`app/components/forms/convenio-*/`)

| Subdir | Files | Size | Coupling |
|--------|-------|------|----------|
| `convenio-marco/` | 5 | ~36KB | 🔴 High (ConvenioMarcoForm imports many) |
| `convenio-practica-marco/` | 2 | ~27KB | 🔴 High |
| `convenio-especifico/` | 1 | ~15KB | 🟡 Medium |
| `convenio-particular/` | 1 | ~18KB | 🟡 Medium |
| `acuerdo-colaboracion/` | 1 | ~29KB | 🟡 Medium |
| `dynamic/` | 0 | Empty | ✅ Already moved |

**Total:** 10 files, ~125KB (not yet migrated to features)

---

## 2. Metrics (Import Counts)

### Compat Layer Usage

| Pattern | Import Count | Files Using |
|---------|--------------|-------------|
| `@/app/components/convenios` | 2 | ConvenioFormLayout.tsx, convenio-detalle/page.tsx |
| `@/app/components/forms` | 4 | TemplateWizard, convenio-configs, form-wrapper, convenio-detalle |
| `@/app/components/dashboard` | 5 | ConvenioFormLayout, DynamicConvenioPage, templates/page, plantillas/new, profesor/page |
| `@/app/components/admin` | 0 | — |
| `@/components/` (root) | 1 | app/layout.tsx |

### Top Files Depending on Compat Layers

1. `src/features/agreements/components/layout/ConvenioFormLayout.tsx` (2 compat imports)
2. `app/protected/convenio-detalle/[id]/page.tsx` (2 compat imports)
3. `src/features/agreements/components/core/convenio-configs.tsx` (1 compat import)
4. `src/features/templates/components/TemplateWizard.tsx` (1 compat import)
5. `app/protected/solicitudes/new/[formId]/form-wrapper.tsx` (1 compat import)
6. `src/features/agreements/components/forms/dynamic/DynamicConvenioPage.tsx` (1 compat import)
7. `app/protected/admin/templates/page.tsx` (1 compat import)
8. `app/protected/admin/plantillas/new/page.tsx` (1 compat import)
9. `app/protected/profesor/[id]/page.tsx` (1 compat import)

---

## 3. Analysis: Stage 5C vs 4C

### Stage 5C: Remove Compat Layers

**Goal:** Eliminate indirection, all imports go directly to `@/features/*` or `@/shared/*`

| Pros | Cons |
|------|------|
| ✅ Cleaner imports | ⚠️ ~12 files need import updates |
| ✅ No more compat indirection | ⚠️ Slightly more verbose imports |
| ✅ Enables deleting `app/components/` subdirs | |
| ✅ Low effort (~15 min) | |

**Risk:** Low — All changes are import path updates, no logic changes.

**Safe Strategy:**
1. Update 12 imports → `@/features/agreements` or `@/shared/*`
2. Delete compat layer index.ts files
3. Optionally delete unused `components/` root files

---

### Stage 4C: Migrate Convenio-Specific Forms

**Goal:** Move 10 form files from `app/components/forms/convenio-*/` to `src/features/agreements/components/forms/convenio-*/`

| Pros | Cons |
|------|------|
| ✅ Complete agreements domain in features | 🔴 High coupling to convenio-configs |
| ✅ Better module isolation | 🔴 May need refactor of convenio-configs |
| | 🔴 ~125KB of complex forms to move |
| | 🔴 ~30+ min work |

**Risk:** Medium-High — Forms have hardcoded imports and tight coupling.

**Safe Strategy (if doing 4C):**
1. **4C1:** Move Marco + Practica Marco forms (7 files, highest complexity first)
2. **4C2:** Move remaining 3 forms (especifico, particular, acuerdo)
3. Update convenio-configs to use new paths

---

## 4. Recommendation

### ✅ Recommended Order: **5C → 4C (optional)**

| Stage | Description | Effort | Risk |
|-------|-------------|--------|------|
| **5C** | Remove compat layers | ~15 min | 🟢 Low |
| **4C** (optional) | Migrate convenio forms | ~45 min | 🟡 Medium |

### Justification

1. **5C is low-risk cleanup** — Only import path changes, no logic
2. **5C unlocks deletion** — Can remove empty `app/components/*` dirs
3. **4C is high-effort, low-urgency** — Forms work fine where they are
4. **4C better as "Phase 2"** — When you have more time for deep refactor

### Alternative: Skip 4C entirely

If forms `convenio-*` don't change often, leaving them in `app/components/forms/` is acceptable. They're not legacy code, just not in the "ideal" location.

---

## 5. GO/NO-GO Checklist

### For Stage 5C

| Check | Status |
|-------|--------|
| Build passes | ✅ (verified post-5B) |
| No active imports to deleted folders | ✅ |
| Compat layers documented | ✅ |
| Import update list ready | ✅ (12 files) |
| **GO for 5C?** | ✅ YES |

### For Stage 4C

| Check | Status |
|-------|--------|
| convenio-configs coupling analyzed | ⚠️ Needs review |
| Split into 4C1/4C2 | ✅ Proposed |
| Time available for 45+ min refactor | ❓ User decision |
| **GO for 4C?** | ⚠️ Conditional — only if time permits |

---

## 6. Action Plan

### If approving 5C:

1. Update 12 imports from `@/app/components/*` → `@/features/*` or `@/shared/*`
2. Delete compat layer files:
   - `app/components/convenios/index.ts`
   - `app/components/forms/index.ts`
   - `app/components/dashboard/index.ts`
   - `app/components/admin/index.ts`
3. Optionally delete unused `components/` root files (logos, env-warning)
4. Commit: `chore: remove compat layers`

### If approving 4C after 5C:

1. **4C1:** Move `convenio-marco/`, `convenio-practica-marco/` to features
2. Update convenio-configs imports
3. Build + test
4. **4C2:** Move remaining 3 forms
5. Commit: `refactor(agreements): migrate convenio forms to features`

---

## Validation Status (HEAD)

| Check | Result |
|-------|--------|
| `npm run build` | ✅ PASS (33 pages) |
| `npm run typecheck` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run test` | ✅ PASS (1 test file) |
