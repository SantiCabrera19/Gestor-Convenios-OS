-- 1. Agregar columna template_path a form_definitions si no existe
ALTER TABLE public.form_definitions 
ADD COLUMN IF NOT EXISTS template_path text;

-- 2. Agregar columnas faltantes a convenio_types (para evitar errores de constraints)
ALTER TABLE public.convenio_types 
ADD COLUMN IF NOT EXISTS template_content text DEFAULT '',
ADD COLUMN IF NOT EXISTS fields jsonb DEFAULT '[]'::jsonb;

-- 3. Recargar el caché de esquema (esto lo hace Supabase automáticamente, pero es bueno saberlo)
NOTIFY pgrst, 'reload schema';
