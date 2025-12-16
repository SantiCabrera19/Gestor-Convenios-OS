# NexusDoc Architecture Guide

> **Last Update:** 2025-12-15 (Post Stage 5B)

## Principles

1. **`app/` = Routing + Wiring** — Only Next.js pages, layouts, and API routes
2. **`src/` = Business Logic** — All features, shared code, and infrastructure
3. **No circular imports** — Features depend on shared/infrastructure, never vice versa
4. **Barrel exports** — Each module exports via index.ts

---

## Folder Structure

```
proyecto/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── protected/                # Auth-protected pages
│   ├── components/               # Compat layers (temporary)
│   └── (auth routes)/            # sign-in, sign-up, etc.
│
├── src/
│   ├── features/                 # Domain-specific modules
│   │   ├── agreements/           # Convenios feature
│   │   │   ├── components/
│   │   │   │   ├── core/         # Headers, configs, navigation
│   │   │   │   ├── forms/        # Form renderers, steppers
│   │   │   │   ├── cards/        # List item cards
│   │   │   │   └── layout/       # Form layouts, previews
│   │   │   └── index.ts
│   │   └── templates/            # Admin plantillas feature
│   │       ├── components/
│   │       └── index.ts
│   │
│   ├── shared/                   # Cross-cutting concerns
│   │   ├── components/ui/        # Design system (34 components)
│   │   ├── dashboard/            # Dashboard utilities
│   │   ├── services/             # Business services
│   │   ├── storage/              # Storage providers
│   │   ├── types/                # Shared TypeScript types
│   │   └── utils/                # Utility functions
│   │
│   └── infrastructure/           # External integrations
│       ├── supabase/             # Auth, database client
│       └── google-drive/         # Drive API client
│
└── components/                   # Legacy (to be cleaned)
```

---

## Import Rules

### ✅ Allowed

| From | Can Import |
|------|------------|
| `app/` pages | `@/features/*`, `@/shared/*`, `@/infrastructure/*` |
| `features/*` | `@/shared/*`, `@/infrastructure/*`, other features (sparingly) |
| `shared/*` | `@/infrastructure/*`, other `@/shared/*` |
| `infrastructure/*` | Only external packages |

### ❌ Forbidden

| Pattern | Why |
|---------|-----|
| `@/app/components/*` | Use `@/features/*` or `@/shared/*` instead |
| `@/lib/*`, `@/utils/*` | Legacy paths, deleted |
| Circular imports | Breaks module boundaries |

---

## Path Aliases (tsconfig.json)

```json
{
  "@/*": ["./*"],
  "@/features/*": ["src/features/*"],
  "@/shared/*": ["src/shared/*"],
  "@/infrastructure/*": ["src/infrastructure/*"]
}
```

---

## Adding a New Feature

### Checklist

1. **Create folder structure:**
   ```
   src/features/[feature-name]/
   ├── components/
   │   └── [Component].tsx
   ├── hooks/          (optional)
   ├── types/          (optional)
   └── index.ts
   ```

2. **Create barrel export (`index.ts`):**
   ```ts
   export { MyComponent } from './components/MyComponent';
   export type { MyType } from './types';
   ```

3. **Import in pages:**
   ```tsx
   import { MyComponent } from '@/features/[feature-name]';
   ```

4. **Run verification:**
   ```bash
   npm run build && npm run typecheck
   ```

---

## Current Compat Layers (Temporary)

> These re-export from `@/features/*` for backward compatibility.  
> Will be removed in Stage 5C.

| File | Re-exports |
|------|------------|
| `app/components/convenios/index.ts` | agreements core + layout |
| `app/components/forms/index.ts` | agreements forms |
| `app/components/dashboard/index.ts` | agreements cards + dashboard |
| `app/components/admin/index.ts` | templates components |

---

## Validation Commands

```bash
npm run build      # Full Next.js build
npm run typecheck  # TypeScript only
npm run lint       # ESLint
npm run test       # Vitest
```
