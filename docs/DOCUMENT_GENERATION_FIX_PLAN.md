# Document Generation Flow Audit

**Fecha:** 2024-12-24  
**Estado:** Análisis completado

---

## 1. Resumen del Problema Reportado

> "Se está subiendo la plantilla SIN PROCESAR al Drive (sin reemplazo de variables)"

**Archivo en Drive:** `template_convenio-microsoft_1766621394733.docx`

---

## 2. Hallazgo Crítico

### ⚠️ El archivo que ves en Drive es la PLANTILLA, no un convenio enviado

Los logs que compartiste:
```
📋 [Templates API] Creating new template: Convenio Microsoft
📁 [Templates API] Uploading template file: template_convenio-microsoft_...
✅ [Templates API] File saved: ...
```

Estos logs son de **`/api/admin/templates/route.ts`** — la ruta que sube la plantilla cuando la CREÁS, NO cuando envíás un convenio.

**La plantilla se sube a Drive cuando la creás** (comportamiento correcto).

El archivo `template_convenio-microsoft_...` en `/pendientes` es **esperado** porque así funciona ahora el código que arreglamos antes.

---

## 3. Flujo Actual (Correcto)

### Flujo de Crear Plantilla (admin)
```
Admin sube archivo .docx
    │
    ▼
POST /api/admin/templates
    │
    ├── Decodifica base64
    ├── Sube archivo a Drive como "template_XXX.docx"
    ├── Guarda URL en form_definitions.template_path
    └── ✅ Plantilla lista
```

### Flujo de Enviar Convenio (usuario)
```
Usuario llena formulario
    │
    ▼
submitSolicitud() en app/actions/submit-solicitud.ts
    │
    ├── Crea registro en tabla convenios
    ├── Obtiene template_path de form_definitions
    ├── Llama a DocumentGenerator.generateDocument(template_path, formData)
    │       │
    │       ├── Descarga plantilla de Drive (getFileContent)
    │       ├── Procesa con Docxtemplater (reemplaza {{variables}})
    │       └── Retorna Buffer del documento procesado
    │
    ├── Sube documento procesado como "convenio_ID.docx"
    └── ✅ Documento final en Drive
```

---

## 4. Verificación Necesaria

### ¿El flujo de submit realmente se ejecutó?

Cuando el usuario envía un convenio, los logs deberían mostrar:

```
📋 [Submit] Form definition: { id: X, template_path: 'https://...' }
📦 [Submit] Storage provider: drive
📄 [Submit] Generating document from template...
```

**Pregunta clave:** ¿Viste estos logs cuando creaste el convenio?

Si **NO los viste**, significa que:
1. El `template_path` sigue siendo null (no se guardó correctamente)
2. O el submit falló antes de llegar a esa parte

---

## 5. Problema Real Identificado

### El template se sube a la carpeta INCORRECTA

Cuando creás la plantilla, el código la sube a:
- `storage.saveFile(buffer, fileName, mimeType)` **SIN especificar folderId**

Esto significa que se sube a la carpeta **por defecto (PENDING)** en lugar de una carpeta de templates.

**Resultado:** La plantilla aparece en `/pendientes` mezclada con los convenios.

---

## 6. Propuesta de Fix

### Fix 1: Mover plantillas a carpeta separada

En `/api/admin/templates/route.ts`, especificar una carpeta diferente para templates:

```typescript
// Crear carpeta TEMPLATES si no existe, o usar ROOT
const templateFolderId = storage.getSystemFolderId ? 
  storage.getSystemFolderId('root') : undefined;

const storedFile = await storage.saveFile(
    buffer, 
    fileName, 
    mimeType,
    templateFolderId  // <-- Especificar carpeta
);
```

### Fix 2: Agregar más logs al submit para diagnóstico

En `submit-solicitud.ts`, agregar logs de error más detallados:

```typescript
if (formDef.template_path) {
  console.log('📄 [Submit] Generating document from template:', formDef.template_path);
  try {
    const generatedDocBuffer = await DocumentGenerator.generateDocument(formDef.template_path, formData);
    console.log('✅ [Submit] Document generated, size:', generatedDocBuffer.length, 'bytes');
    // ... resto del código
  } catch (genError) {
    console.error('❌ [Submit] Error generating document:', genError);
    throw genError; // Re-throw para ver el error completo
  }
} else {
  console.warn('⚠️ [Submit] No template_path found, skipping document generation');
}
```

---

## 7. Checklist de Validación

### Pre-test
- [ ] Verificar en Supabase que `form_definitions.template_path` NO es null
- [ ] El path debe ser una URL de Google Drive válida

### Test de Submit
- [ ] Crear un convenio con la plantilla
- [ ] Verificar en terminal los logs:
  - `📋 [Submit] Form definition: { id: X, template_path: '...' }`
  - `📄 [Submit] Generating document from template...`
  - `✅ [Submit] Document generated, size: ... bytes`
  - `Document generated and saved: ...`
- [ ] Verificar en Drive que aparece `convenio_X.docx` (NO `template_...`)

---

## 8. Próximos Pasos

1. **Verificar** en Supabase si `form_definitions.template_path` tiene valor
2. **Agregar logs** más detallados al submit
3. **Probar** enviar un convenio y revisar logs
4. Si falla en `getFileContent`, revisar que el file ID se extrae correctamente de la URL

---

## Archivos Involucrados

| Archivo | Propósito |
|---------|-----------|
| `app/api/admin/templates/route.ts` | Crear plantilla (sube archivo) |
| `app/actions/submit-solicitud.ts` | Enviar convenio (genera documento) |
| `src/shared/services/document-generator.ts` | Procesa plantilla con Docxtemplater |
| `src/shared/storage/google-drive-provider.ts` | Operaciones de Drive |

---

**¿Aprobás agregar los logs de diagnóstico para confirmar el flujo?**
