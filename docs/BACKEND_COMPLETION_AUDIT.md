# Backend Completion Audit Report

**Fecha:** 2024-12-28  
**Estado:** Auditoría completada — Listo para ejecución

---

## 1. Resumen Ejecutivo

| Área | Estado | Acción Requerida |
|------|--------|------------------|
| **Email Service (Resend)** | ✅ Existe | Agregar templates para APROBADO/RECHAZADO |
| **Notification Service** | ✅ Completo | Ya funciona, solo verificar integración |
| **Toast/UI Notifications** | ✅ Completo | Ya existe ToastProvider |
| **Actions Route (Admin)** | ✅ Parcial | Agregar envío de emails |
| **OAuth Error Handling** | ⚠️ Parcial | Mejorar logs, no silenciar errores |
| **Drive IDs** | ❌ Hardcoded | Mover a env vars |
| **Env Vars** | ⚠️ Falta | Agregar NEXT_PUBLIC_APP_URL |

---

## 2. Hallazgos Detallados

### 2.1 Email Service

**Archivo:** `src/shared/services/email-service.ts`

| Característica | Estado |
|----------------|--------|
| Provider | Resend ✅ |
| API Key | `RESEND_API_KEY` en .env.local ✅ |
| Template Corrección | ✅ Existe (con link directo) |
| Template Aprobado | ❌ NO EXISTE |
| Template Rechazado | ❌ NO EXISTE |

**Código existente:**
```typescript
// Solo tiene sendCorrectionRequestEmail()
// Falta: sendApprovalEmail(), sendRejectionEmail()
```

---

### 2.2 Notification Service

**Archivo:** `src/shared/services/notification-service.ts`

| Método | Estado |
|--------|--------|
| `convenioCreated` | ✅ |
| `convenioApproved` | ✅ |
| `convenioRejected` | ✅ |
| `convenioSentToCorrection` | ✅ |
| `convenioResubmitted` | ✅ |
| `documentGenerated` | ✅ |
| `custom` | ✅ |

**Escribe a:** Tabla `notifications` en Supabase

---

### 2.3 Toast Component

**Archivo:** `src/shared/components/ui/toast.tsx`

| Característica | Estado |
|----------------|--------|
| ToastProvider | ✅ |
| useToast hook | ✅ |
| Tipos (success/error/warning/info) | ✅ |
| Auto-dismiss | ✅ (5 segundos) |
| Animaciones | ✅ |

---

### 2.4 Actions Route (Admin Aprueba/Rechaza)

**Archivo:** `app/api/admin/convenios/[id]/actions/route.ts`

| Acción | Notificación Interna | Email |
|--------|---------------------|-------|
| approve | ✅ `NotificationService.convenioApproved` | ❌ No envía |
| reject | ✅ `NotificationService.convenioRejected` | ❌ No envía |
| correct | ✅ `NotificationService.convenioSentToCorrection` | ❌ No envía |

**⚠️ PROBLEMA:** Las notificaciones internas funcionan, pero NO se envían emails.

---

### 2.5 Env Vars

**Archivo:** `.env.local`

| Variable | Estado | Valor |
|----------|--------|-------|
| RESEND_API_KEY | ✅ Existe | `re_UxppCwkz_...` |
| NEXT_PUBLIC_APP_URL | ❌ FALTA | Necesario para links en emails |
| DRIVE_ROOT_ID | ❌ FALTA | Hardcodeado |
| DRIVE_PENDING_ID | ❌ FALTA | Hardcodeado |
| DRIVE_APPROVED_ID | ❌ FALTA | Hardcodeado |
| DRIVE_REJECTED_ID | ❌ FALTA | Hardcodeado |
| DRIVE_ARCHIVED_ID | ❌ FALTA | Hardcodeado |
| DRIVE_TEMPLATES_ID | ❌ FALTA | Hardcodeado |

---

### 2.6 Drive IDs Hardcodeados

**Archivos afectados:**
- `src/infrastructure/google-drive/client.ts` (líneas 7-13)
- `src/shared/storage/google-drive-provider.ts` (líneas 7-13)
- `app/api/admin/templates/route.ts` (línea 31)

---

## 3. Plan de Ejecución

### Paso 1: Mergear rama Drive ✅
```bash
git checkout main
git merge chore/drive-migration-documentos
```

### Paso 2: Agregar env vars faltantes
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DRIVE_ROOT_ID=1p6W4hV10Pfk6ebOBtqMsSo57HrU1slq4
DRIVE_PENDING_ID=1fMPMojrkvomzl0Inbqy9bMV4szHRjzJA
DRIVE_APPROVED_ID=1HEY4kSXjco_W1LBqYvn-FwbDll22XRii
DRIVE_REJECTED_ID=1FimWHwQUdsuctGrVumsxQv826L1pRorC
DRIVE_ARCHIVED_ID=1wHERHIkq1kC-fb9upGXrV2lzPpldBJOw
DRIVE_TEMPLATES_ID=1adJF4HHCK2WQk3F13OnRJrj2o9yDb5Ew
```

### Paso 3: Agregar templates de email
En `email-service.ts`:
- `sendApprovalEmail(data)` — Sin link, solo notificación
- `sendRejectionEmail(data)` — Con motivo, sin link

### Paso 4: Integrar emails en actions/route.ts
```typescript
// Después de NotificationService.convenioApproved:
await sendApprovalEmail({ ... });

// Después de NotificationService.convenioRejected:
await sendRejectionEmail({ ... });

// Ya existe lógica de corrección, agregar email:
await sendCorrectionRequestEmail({ ... });
```

### Paso 5: Refactorizar Drive IDs a env vars
En `client.ts` y `google-drive-provider.ts`:
```typescript
export const DRIVE_FOLDERS = {
  ROOT: process.env.DRIVE_ROOT_ID!,
  PENDING: process.env.DRIVE_PENDING_ID!,
  // ...
};
```

### Paso 6: Mejorar error handling OAuth
Agregar logs detallados en catch blocks.

---

## 4. Código a Reutilizar (NO duplicar)

| Componente | Archivo | Uso |
|------------|---------|-----|
| Resend client | `email-service.ts` | Reutilizar instancia |
| NotificationService | `notification-service.ts` | Reutilizar métodos |
| ToastProvider | `toast.tsx` | Ya en layout |
| DRIVE_FOLDERS | `client.ts` | Refactorizar a env vars |

---

## 5. Código Muerto Identificado

| Archivo | Problema | Acción |
|---------|----------|--------|
| Ninguno crítico | — | — |

---

## 6. Checklist Post-Ejecución

- [ ] Mergear rama a main
- [ ] npm run build PASS
- [ ] npm run test PASS
- [ ] Email de aprobación llega
- [ ] Email de rechazo llega
- [ ] Email de corrección llega con link
- [ ] Notificación interna aparece
- [ ] Drive IDs desde env vars
- [ ] OAuth errors logueados

---

**¿Aprobás el plan de ejecución?**
