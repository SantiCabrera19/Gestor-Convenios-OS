
# 🏛️ Sistema de Gestión de Convenios (Versión UTN)

> **Estado del Proyecto:** Funcional / En Transición a Open Source Agnóstico.

Este repositorio contiene una aplicación completa para la gestión, generación y firma de convenios institucionales. Actualmente, está configurada específicamente para los flujos de trabajo de la **UTN (Universidad Tecnológica Nacional)**, utilizando **Supabase** como base de datos y **Google Drive** como almacenamiento documental.

## 🚀 Estado Actual

El sistema es **totalmente funcional** y reproducible para instituciones que deseen replicar el stack tecnológico actual.

### ✅ Funcionalidades Activas
*   **Gestión de Usuarios:** Roles (Admin, User) y autenticación vía Google OAuth.
*   **Motor de Formularios:** Formularios multi-paso (Stepper) con validación robusta (Zod + React Hook Form).
*   **Generación de Documentos:** Motor de plantillas `.docx` que rellena automáticamente los datos del formulario.
*   **Persistencia:** Base de datos PostgreSQL (vía Supabase).
*   **Almacenamiento:** Integración nativa con Google Drive API (con renovación automática de tokens) para guardar los convenios generados.
*   **UI/UX:** Interfaz moderna construida con Next.js 14, Tailwind CSS y Shadcn/UI.

### 🚧 Limitaciones Actuales (Roadmap Open Source)
Aunque el sistema es operativo, **NO es aún una plataforma agnóstica**. Actualmente presenta un acoplamiento fuerte con las tecnologías seleccionadas:

1.  **Base de Datos:** La lógica de persistencia está atada al cliente de Supabase. No soporta nativamente MySQL, SQL Server o adaptadores locales (Excel/JSON) sin refactorización.
2.  **Storage:** La subida de archivos depende exclusivamente de la API de Google Drive. No hay soporte inmediato para Dropbox, AWS S3, Mega o almacenamiento local.
3.  **Formularios Estáticos:** Los formularios y sus validaciones están definidos en código (`.tsx`). No existe un sistema de "Drag & Drop" o detección automática de variables en las plantillas Word para autogenerar los campos.

---

## 🛠️ Instalación y Configuración

Si deseas desplegar esta versión (Stack: Next.js + Supabase + Google Drive), sigue estos pasos:

### 1. Clonar y Dependencias
```bash
git clone <repo-url>
cd convenios-utn
npm install
```

### 2. Configuración de Entorno
Copia el archivo de ejemplo y rellena tus credenciales:
```bash
cp .env.example .env.local
```
*Necesitarás un proyecto en Supabase y credenciales de Google Cloud Console con la API de Drive habilitada.*

### 3. Base de Datos
Ejecuta el script `database/schema.sql` en el editor SQL de tu proyecto Supabase para crear las tablas necesarias (`convenios`, `profiles`, `google_oauth_tokens`, etc.).

### 4. Ejecución
```bash
npm run dev
```

---

## 🗺️ Roadmap hacia la Arquitectura Hexagonal

El objetivo final de este proyecto es convertirse en una solución **Open Source Empresarial**, desacoplada de proveedores específicos.

### Próximos Hitos:
1.  **Arquitectura de Puertos y Adaptadores:** Abstraer la capa de datos (`DatabaseRepository`) y almacenamiento (`StorageProvider`) para permitir plugins (ej: MySQL Adapter, S3 Adapter).
2.  **Motor de Formularios Dinámicos:** Implementar un parser que lea plantillas `.docx`, detecte variables (ej: `{nombre_empresa}`) y genere el formulario de React automáticamente.
3.  **Sistema de Plugins:** Permitir a la comunidad crear sus propios adaptadores de integración.

---

**Licencia:** MIT

---

<div align="center">
  <p>Desarrollado para la Universidad Tecnológica Nacional - Facultad Regional Resistencia</p>
  <p>Contacto: <a href="mailto:santycabrera150@gmail.com">Santiago Cabrera</a> | <a href="mailto:agustin.eze.gambera@gmail.com">Agustín Gambera</a></p>
</div>
