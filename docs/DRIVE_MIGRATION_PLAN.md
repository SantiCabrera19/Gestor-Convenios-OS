# Drive Migration Plan: UTN → DocumentosOS

**Fecha:** 2024-12-24  
**Estado:** Plan aprobado, pendiente ejecución

---

## Resumen Ejecutivo

| Aspecto | Valor |
|---------|-------|
| **Objetivo** | Migrar de Drive UTN a Drive DocumentosOS (práctica) |
| **Riesgo** | 🟢 Bajo — Solo cambio de IDs de carpetas |
| **Archivos a modificar** | 2 archivos + 1 env var |
| **Tiempo estimado** | ~15 minutos |
| **Requiere reauth** | ✅ Sí (admin debe reconectar Drive) |

---

## 1. Auditoría del Flujo Actual

### 1.1 Obtención de Credenciales (Env Vars)

El sistema usa **3 variables de entorno** para OAuth:

| Variable | Valor en `.env.local` | Estado |
|----------|----------------------|--------|
| `GOOGLE_CLIENT_ID` | `274252890120-kiec7...` | ✅ **Ya es DocumentosOS** |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-z8LzT6...` | ✅ **Ya es DocumentosOS** |
| `GOOGLE_REDIRECT_URI` | `https://xhiwwydnftkalfawwqvf.supabase.co/auth/v1/callback` | ✅ OK |

> [!IMPORTANT]
> Las env vars de OAuth **ya están configuradas para DocumentosOS**. No hay que cambiarlas.

### 1.2 Obtención de Tokens (Supabase)

**Flujo:**
```
getOAuthClient() → Supabase Admin Client
                 → Query profiles WHERE role = 'admin'
                 → Query google_oauth_tokens WHERE user_id IN (admins)
                 → Devuelve access_token + refresh_token del primer admin
```

**Tabla:** `google_oauth_tokens`

| Columna | Propósito |
|---------|-----------|
| `user_id` | ID del usuario en Supabase |
| `access_token` | Token de acceso a Google Drive |
| `refresh_token` | Token para renovar el access_token |
| `expires_at` | Fecha de expiración del access_token |

> [!NOTE]
> Los tokens actuales están asociados a una cuenta de Google que tiene acceso al Drive de **UTN**. 
> Cuando hagas re-auth con una cuenta que tenga acceso a tu Drive de **DocumentosOS**, los tokens se actualizarán automáticamente.

### 1.3 Scopes de OAuth

El sistema pide scopes implícitos a través de la API de Google Drive v3:
- `https://www.googleapis.com/auth/drive.file` (mínimo para crear/modificar archivos)

### 1.4 Ubicaciones de DRIVE_FOLDERS

> [!CAUTION]
> DRIVE_FOLDERS está **duplicado** en 2 archivos con los **mismos IDs de UTN**:

| Archivo | Líneas | Estado |
|---------|--------|--------|
| `src/infrastructure/google-drive/client.ts` | 7-13 | ⚠️ **IDs de UTN** |
| `src/shared/storage/google-drive-provider.ts` | 7-13 | ⚠️ **IDs de UTN** |

**Valores actuales (UTN):**
```typescript
export const DRIVE_FOLDERS = {
  ROOT: '1od2SuLoJPgxS5OTyps_UhCEvhvhWT3mz',     // UTN
  PENDING: '1IwXiatPJ-j98oC7XKrd9xK7VF52fVNaJ',  // UTN
  APPROVED: '19BAZjx93AsHZ45s3U6afISMQJy5zdzPm', // UTN
  REJECTED: '16JY2aSOp57qn7Ow4BBRZqqq1xK_kv7PQ', // UTN
  ARCHIVED: '15LlGgNqCVMhjcpZBJUSVKvq4AwkRFSr1', // UTN
};
```

### 1.5 Archivos que Importan DRIVE_FOLDERS

| Archivo | Import | Uso |
|---------|--------|-----|
| `app/api/admin/convenios/[id]/actions/route.ts` | ✅ Directo | `DRIVE_FOLDERS.APPROVED`, `.REJECTED`, `.ARCHIVED` |

---

## 2. Verificación de Env Vars

### Estado Actual de `.env.local`

| Variable | Presente | Valor |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://xhiwwydnftkalfawwqvf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `eyJhbGciOiJIUzI1...` |
| `GOOGLE_CLIENT_ID` | ✅ | `274252890120-kiec7...` (DocumentosOS) |
| `GOOGLE_CLIENT_SECRET` | ✅ | `GOCSPX-z8LzT6...` |
| `GOOGLE_REDIRECT_URI` | ✅ | `https://xhiwwydnftkalfawwqvf.supabase.co/auth/v1/callback` |
| `STORAGE_PROVIDER` | ❌ **FALTA** | No definida (default: `local`) |

> [!WARNING]
> Falta añadir `STORAGE_PROVIDER=drive` para que el sistema use Google Drive en lugar del sistema de archivos local.

---

## 3. Propuesta de Migración

### 3.1 Pasos Mínimos para No Subir a UTN

| Paso | Acción | Razón |
|------|--------|-------|
| 1 | Crear carpetas en tu Drive de DocumentosOS | Para obtener los nuevos IDs |
| 2 | Reemplazar IDs en `client.ts` y `google-drive-provider.ts` | Los IDs determinan destino |
| 3 | Añadir `STORAGE_PROVIDER=drive` a `.env.local` | Para activar el provider de Drive |
| 4 | Re-autorizar el admin en la app | Para vincular tokens a tu cuenta con acceso a DocumentosOS |

### 3.2 ¿Env Vars o Solo IDs?

| Opción | Ventaja | Desventaja | Recomendación |
|--------|---------|------------|---------------|
| Mover IDs a env vars | Flexibilidad | Más complejidad | ⏳ Futuro |
| Hardcodear nuevos IDs | Simple, rápido | Menos flexible | ✅ **Ahora** |

**Decisión:** Reemplazar IDs hardcodeados ahora. Mover a env vars en una iteración futura si lo necesitás.

### 3.3 ¿Hay que Hacer Re-auth?

**Sí.** El token actual está asociado a una cuenta de Google con acceso al Drive de UTN.

Para que funcione con DocumentosOS:
1. El admin debe ir a Configuración
2. Desconectar la cuenta actual (si hay UI para eso) o limpiar `google_oauth_tokens`
3. Conectar con una cuenta que tenga acceso al Drive de DocumentosOS

### 3.4 ¿Riesgo de Seguir Escribiendo a UTN?

| Escenario | Riesgo |
|-----------|--------|
| Si cambiamos IDs pero no re-auth | 🔴 Error — Token no tiene acceso a nuevas carpetas |
| Si re-auth pero no cambiamos IDs | 🔴 Error — IDs apuntan a UTN |
| Si cambiamos IDs + re-auth | ✅ OK — Todo apunta a DocumentosOS |

---

## 4. Plan de Ejecución

### Paso 0: Pre-requisitos (Manual)

Antes de tocar código, necesitás:

1. **Crear estructura de carpetas en tu Google Drive:**
   ```
   DocumentosOS/
   ├── pendientes/
   ├── aprobados/
   ├── rechazados/
   └── archivados/
   ```

2. **Obtener los IDs de cada carpeta:**
   - Abrí cada carpeta en Drive
   - La URL será algo como: `https://drive.google.com/drive/folders/XXXXX`
   - El ID es la parte `XXXXX`

3. **Anotar los 5 IDs:**
   - ROOT: (carpeta padre DocumentosOS)
   - PENDING: (pendientes)
   - APPROVED: (aprobados)
   - REJECTED: (rechazados)
   - ARCHIVED: (archivados)

---

### Paso 1: Modificar `src/infrastructure/google-drive/client.ts`

**Líneas 7-13** — Reemplazar IDs:

```typescript
export const DRIVE_FOLDERS = {
  ROOT: 'TU_ID_ROOT',         // Reemplazar con ID de DocumentosOS
  PENDING: 'TU_ID_PENDING',   // Reemplazar con ID de pendientes
  APPROVED: 'TU_ID_APPROVED', // Reemplazar con ID de aprobados
  REJECTED: 'TU_ID_REJECTED', // Reemplazar con ID de rechazados
  ARCHIVED: 'TU_ID_ARCHIVED', // Reemplazar con ID de archivados
} as const;
```

---

### Paso 2: Modificar `src/shared/storage/google-drive-provider.ts`

**Líneas 7-13** — Reemplazar IDs (mismos valores):

```typescript
export const DRIVE_FOLDERS = {
  ROOT: 'TU_ID_ROOT',         // Mismo ID que en client.ts
  PENDING: 'TU_ID_PENDING',   
  APPROVED: 'TU_ID_APPROVED', 
  REJECTED: 'TU_ID_REJECTED', 
  ARCHIVED: 'TU_ID_ARCHIVED', 
} as const;
```

> [!TIP]
> Consolidación futura: Deberíamos tener DRIVE_FOLDERS en un solo lugar e importarlo donde se necesite. Pero eso es refactor adicional.

---

### Paso 3: Modificar `.env.local`

Añadir al final:

```
STORAGE_PROVIDER=drive
```

---

### Paso 4: Limpiar tokens antiguos en Supabase

1. Ir a Supabase Dashboard → Table Editor → `google_oauth_tokens`
2. Borrar todas las filas (o solo la del admin actual)

---

### Paso 5: Re-autorizar en la App

1. Iniciar sesión como admin
2. Ir a Configuración (o la pantalla de conexión con Google)
3. Conectar con la cuenta de Google que tenga acceso a las carpetas de DocumentosOS

---

### Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/infrastructure/google-drive/client.ts` | Reemplazar 5 IDs |
| `src/shared/storage/google-drive-provider.ts` | Reemplazar 5 IDs |
| `.env.local` | Añadir `STORAGE_PROVIDER=drive` |
| Supabase: `google_oauth_tokens` | Limpiar filas |
| App: Admin | Re-auth con cuenta DocumentosOS |

**Commits sugeridos:**
- 1 solo commit: `chore: migrate Drive from UTN to DocumentosOS`

---

## 5. Checklist de Validación Post-Cambio

### Build & Tests

- [ ] `npm run build` pasa
- [ ] `npm run typecheck` pasa
- [ ] `npm run lint` pasa
- [ ] `npm run test` pasa

### Funcionalidad Manual

- [ ] Admin puede conectar su cuenta de Google
- [ ] Al crear un convenio, el archivo se sube a la carpeta `pendientes` de DocumentosOS
- [ ] Al aprobar un convenio, el archivo se mueve a `aprobados`
- [ ] Al rechazar un convenio, el archivo se mueve a `rechazados`
- [ ] Al archivar un convenio, el archivo se mueve a `archivados`

### Verificación de Destino

- [ ] Revisar en Google Drive que los archivos aparezcan en las carpetas correctas de DocumentosOS
- [ ] Confirmar que **NO** aparece nada nuevo en el Drive de UTN

---

## 6. Próximos Pasos

1. **Dame los 5 IDs de las carpetas de tu Drive DocumentosOS**
2. Yo ejecuto los cambios en los 2 archivos + .env.local
3. Vos limpíás los tokens en Supabase
4. Vos hacés re-auth en la app
5. Testeamos juntos subiendo un convenio de prueba

---

**¿Aprobás el plan?** Cuando me des los IDs, procedemos a ejecutar.
