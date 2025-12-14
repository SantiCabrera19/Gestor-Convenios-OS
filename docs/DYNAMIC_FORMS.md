# ⚡ Sistema de Formularios Dinámicos

Este documento describe la arquitectura "Receta-Cocinero" implementada para desacoplar la lógica de los formularios del código fuente.

## 🧠 Concepto Central

El sistema se divide en tres capas:

1.  **La Receta (Base de Datos):** Un JSON que define qué campos existen, sus etiquetas, tipos y validaciones.
2.  **El Molde (Sistema de Archivos):** El archivo `.docx` en la carpeta `/templates` que espera recibir esos datos.
3.  **El Cocinero (Frontend):** Un componente React (`DynamicFormRenderer`) que lee la receta y dibuja el formulario automáticamente.

## 📂 Estructura de Archivos

```
/database
  └── dynamic_forms.sql       # Scripts SQL para insertar/actualizar recetas.
/templates
  ├── convenio-marco.docx     # Plantilla física (Word).
  └── ...
/app
  /components
    /forms
      /dynamic
        ├── DynamicFormRenderer.tsx  # El motor que dibuja el form.
        ├── DynamicField.tsx         # Componente para cada input.
        └── DynamicConvenioPage.tsx  # Página contenedora (Maneja carga/errores).
```

## 🔄 Flujo de Trabajo (Workflow)

### ¿Cómo crear o modificar un formulario?

1.  **Preparar el DOCX:**
    *   Asegúrate de que tu archivo en `/templates` tenga las variables correctas (ej: `{{nombre}}`, `{{cuit}}`).

2.  **Definir la Receta:**
    *   Edita o crea una entrada en la tabla `form_definitions` de Supabase.
    *   El JSON debe coincidir con las variables del DOCX.
    *   *Ejemplo:* Si el DOCX tiene `{{razon_social}}`, el JSON debe tener un campo con `name: "razon_social"`.

3.  **¡Listo!**
    *   No hace falta redestribuir (deploy) la aplicación.
    *   Al recargar la página, el formulario se actualizará instantáneamente.

## 🛡️ Manejo de Errores y Estados

*   **Sin Receta:** Si el sistema no encuentra una definición activa para el tipo de convenio, mostrará una pantalla amigable de "Formulario en Configuración", invitando al administrador a contactar a soporte, en lugar de mostrar un error 500.
*   **Carga:** Se utiliza un `Skeleton` loader para mejorar la percepción de velocidad.

## 🔮 Futuro (Fase 3)

*   **Editor Visual:** Crear una interfaz en `/admin` para generar el JSON arrastrando y soltando campos, eliminando la necesidad de escribir SQL.
*   **Subida de Templates:** Permitir subir los `.docx` desde el admin a un Storage (S3/Supabase Storage) en lugar de tenerlos en la carpeta `/templates` del repo.
