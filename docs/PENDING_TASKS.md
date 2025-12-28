# Tareas Pendientes - NexusDoc

**Fecha:** 2024-12-28  
**Rama Actual:** `chore/drive-migration-documentos` (2 commits adelante de main)

---

## 🚀 Listo para Mergear

### Rama: `chore/drive-migration-documentos`

| Commit | Descripción |
|--------|-------------|
| `b10fa62` | Migrate Drive from UTN to DocumentosOS |
| `c83f9e4` | Organize templates in separate Drive folder |

**Acción:** Mergear a `main` cuando confirmes que el Drive funciona correctamente.

---

## 🔧 Pendientes de Desarrollo

### 1. Refactor de Arquitectura (Stages 3-5)

| Tarea | Prioridad | Complejidad |
|-------|-----------|-------------|
| **Stage 3:** Migrar Feature Templates a `src/features/templates/` | Media | Media |
| **Stage 4:** Migrar Feature Agreements a `src/features/agreements/` | Media | Media |
| **Stage 5:** Limpieza final y documentación | Baja | Baja |

### 2. Limpieza de Código Legacy

| Tarea | Archivos Afectados |
|-------|-------------------|
| Eliminar carpetas legacy vacías | `app/components/forms/`, `lib/`, etc. |
| Eliminar imports de compatibilidad | Varios |
| Consolidar tipos duplicados | `types/` folders |

### 3. Mejoras de UX/UI

| Tarea | Descripción |
|-------|-------------|
| Fix "Invalid Date" en convenios | El campo fecha muestra "Invalid Date" |
| Validación de DNI incorrecta | Min/Max valida el valor, no la longitud |
| Mejorar mensajes de error | Los errores se silencian en algunos flujos |

### 4. Mejoras de Drive/Documentos

| Tarea | Descripción |
|-------|-------------|
| Mover IDs de carpetas a env vars | Actualmente hardcodeados en código |
| Agregar logs de diagnóstico | Para debugging de uploads |
| Manejar errores de OAuth mejor | Actualmente silenciados |

---

## 🧪 Testing Pendiente

| Test | Estado |
|------|--------|
| Crear plantilla → va a `/plantillas` | ⏳ Por probar |
| Crear convenio → genera documento con datos | ✅ Confirmado |
| Aprobar convenio → mueve a `/aprobados` | ⏳ Por probar |
| Rechazar convenio → mueve a `/rechazados` | ⏳ Por probar |

---

## 📋 Priorización Sugerida

### Alta Prioridad
1. [ ] Mergear rama de Drive a main
2. [ ] Probar flujo completo (crear, aprobar, rechazar)
3. [ ] Fix validación de DNI

### Media Prioridad
4. [ ] Fix "Invalid Date"
5. [ ] Stages 3-5 del refactor
6. [ ] Mover IDs a env vars

### Baja Prioridad
7. [ ] Limpieza de folders legacy
8. [ ] Documentación de arquitectura
9. [ ] Mejoras de logging

---

## ¿Qué Querés Hacer?

Marcá con ✅ las tareas que querés que ejecute y dame el SÍ.
