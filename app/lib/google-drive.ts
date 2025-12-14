import { google } from 'googleapis';
import { readFileSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Configuración de las carpetas
export const DRIVE_FOLDERS = {
  ROOT: '1od2SuLoJPgxS5OTyps_UhCEvhvhWT3mz', // Carpeta padre del proyecto
  PENDING: '1IwXiatPJ-j98oC7XKrd9xK7VF52fVNaJ', // Carpeta "pendientes"
  APPROVED: '19BAZjx93AsHZ45s3U6afISMQJy5zdzPm', // Carpeta "aprobados"
  REJECTED: '16JY2aSOp57qn7Ow4BBRZqqq1xK_kv7PQ', // Carpeta "rechazados"
  ARCHIVED: '15LlGgNqCVMhjcpZBJUSVKvq4AwkRFSr1', // Carpeta "archivados"
} as const;

// Inicializar el cliente de Google Drive (ELIMINADO - Usando OAuth)
// const auth = new google.auth.GoogleAuth({...});
// export const driveClient = google.drive({ version: 'v3', auth });




// ============================================================================
// FUNCIONES OAUTH (Consolidadas)
// ============================================================================

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Función para obtener cliente OAuth autenticado
async function getOAuthClient() {
  // Para esta operación específica, necesitamos un cliente con privilegios de administrador
  // para poder leer los tokens de CUALQUIER usuario, sin importar quién esté logueado.
  // Esto saltea las políticas de RLS (Row Level Security).
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 1. Buscar TODOS los perfiles con rol de 'admin'
  const { data: adminProfiles, error: adminError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('role', 'admin');

  if (adminError) {
    throw new Error(
      `Error al buscar perfiles de administrador: ${adminError.message}`
    );
  }

  if (!adminProfiles || adminProfiles.length === 0) {
    throw new Error('No se encontró ningún perfil de administrador en el sistema.');
  }

  // Extraer los IDs de todos los admins
  const adminUserIds = adminProfiles.map(p => p.id);

  // 2. De esa lista de admins, encontrar el PRIMERO que tenga un token
  const { data: tokens, error: tokenError } = await supabaseAdmin
    .from('google_oauth_tokens')
    .select('*')
    .in('user_id', adminUserIds)
    .limit(1)
    .maybeSingle(); // .maybeSingle() no falla si no encuentra nada, solo devuelve null

  if (tokenError) {
    throw new Error(`Error al buscar el token de OAuth: ${tokenError.message}`);
  }

  if (!tokens) {
    throw new Error(
      '❌ Ninguno de los administradores tiene un token de Google Drive válido conectado. Conectar en Configuración.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  // Establecer credenciales
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expires_at
      ? new Date(tokens.expires_at).getTime()
      : null,
  });

  // Manejar la renovación automática del token si está cerca de expirar
  if (tokens.expires_at) {
    const now = new Date();
    const expiryDate = new Date(tokens.expires_at);
    const buffer = 5 * 60 * 1000; // 5 minutos de margen

    if (expiryDate.getTime() < now.getTime() + buffer) {
      console.log('🔄 [OAuth] Token expirado o a punto de expirar, renovando...');
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        // Actualizar los nuevos tokens en la base de datos usando el cliente admin
        await supabaseAdmin
          .from('google_oauth_tokens')
          .update({
            access_token: credentials.access_token,
            refresh_token:
              credentials.refresh_token || tokens.refresh_token, // Mantener el viejo si no viene uno nuevo
            expires_at: credentials.expiry_date
              ? new Date(credentials.expiry_date).toISOString()
              : null,
          })
          .eq('user_id', tokens.user_id);

        console.log(
          '✅ [OAuth] Token renovado y actualizado en la base de datos.'
        );
      } catch (refreshError) {
        console.error('❌ [OAuth] Error al renovar el token:', refreshError);
        throw new Error(
          'No se pudo renovar el token de acceso de Google Drive.'
        );
      }
    }
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
}


// Función para subir archivos usando OAuth (más simple)
export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  folderId: string = DRIVE_FOLDERS.PENDING,
  convertToGoogleDoc: boolean = true
) {
  try {
    console.log(`📄 [OAuth Drive] Subiendo archivo: ${fileName}`);

    const driveClient = await getOAuthClient();

    const fileMetadata: any = {
      name: fileName,
      parents: [folderId],
    };

    // Si se solicita conversión a Google Doc
    if (convertToGoogleDoc) {
      fileMetadata.mimeType = 'application/vnd.google-apps.document';
    }

    const stream = Readable.from(buffer);

    const media = {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      body: stream,
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink, webContentLink',
    });

    console.log(`✅ [OAuth Drive] Archivo subido: ${fileName}`);

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    };
  } catch (error: any) {
    console.error('❌ [OAuth Drive] Error subiendo archivo:', error);
    throw error;
  }
}

// Función para crear carpetas usando OAuth
export async function createFolderInDrive(
  folderName: string,
  parentFolderId: string = DRIVE_FOLDERS.PENDING
) {
  try {
    console.log(`📁 [OAuth Drive] Creando carpeta: ${folderName}`);

    const driveClient = await getOAuthClient();

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };

    const response = await driveClient.files.create({
      requestBody: fileMetadata,
      fields: 'id, webViewLink',
    });

    console.log(`✅ [OAuth Drive] Carpeta creada: ${folderName}`);

    return {
      folderId: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  } catch (error) {
    console.error('❌ [OAuth Drive] Error creando carpeta:', error);
    throw error;
  }
}

// Función para convenio específico usando OAuth (simplificada)
export async function uploadConvenioEspecifico(
  mainDocumentBuffer: Buffer,
  convenioName: string,
  anexos: { name: string; buffer: ArrayBuffer }[] = [],
  parentFolderId: string = DRIVE_FOLDERS.PENDING
) {
  try {
    console.log('📁 [OAuth Drive] Procesando convenio específico:', convenioName);

    // 1. Crear carpeta para el convenio
    const folderResponse = await createFolderInDrive(convenioName, parentFolderId);
    const convenioFolderId = folderResponse.folderId!;

    // 2. Subir documento principal
    console.log('📄 [OAuth Drive] Subiendo documento principal...');
    const mainDocResponse = await uploadFileToDrive(
      mainDocumentBuffer,
      `${convenioName}.docx`,
      convenioFolderId,
      false // Subir como .docx por ahora
    );

    // 3. Subir anexos
    const anexosUploaded = [];
    for (const anexo of anexos) {
      console.log(`📎 [OAuth Drive] Subiendo anexo: ${anexo.name}`);

      const anexoBuffer = Buffer.from(anexo.buffer);

      const anexoResponse = await uploadFileToDrive(
        anexoBuffer,
        `ANEXO-${anexo.name}`,
        convenioFolderId,
        false
      );

      anexosUploaded.push({
        name: anexo.name,
        ...anexoResponse
      });
    }

    console.log(`✅ [OAuth Drive] Convenio específico completado: ${anexosUploaded.length} anexos`);

    return {
      folderId: convenioFolderId,
      folderWebViewLink: folderResponse.webViewLink,
      mainDocument: mainDocResponse,
      anexos: anexosUploaded,
      totalAnexos: anexos.length,
      // Compatibilidad con código existente
      fileId: mainDocResponse.fileId,
      webViewLink: folderResponse.webViewLink, // Enlace a la carpeta
      webContentLink: mainDocResponse.webContentLink,
    };
  } catch (error) {
    console.error('❌ [OAuth Drive] Error procesando convenio específico:', error);
    throw error;
  }
}

// Función para mover archivos usando OAuth
export async function moveFileToFolder(fileId: string, targetFolderId: string) {
  try {
    console.log(`📁 [OAuth Drive] Moviendo archivo ${fileId} a carpeta ${targetFolderId}`);

    const driveClient = await getOAuthClient();

    // Obtener padres actuales
    const file = await driveClient.files.get({
      fileId,
      fields: 'parents',
    });

    // Mover archivo
    const previousParents = file.data.parents?.join(',');
    if (previousParents) {
      await driveClient.files.update({
        fileId,
        removeParents: previousParents,
        addParents: targetFolderId,
        fields: 'id, parents',
      });
    }

    console.log(`✅ [OAuth Drive] Archivo movido exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ [OAuth Drive] Error moviendo archivo:', error);
    throw error;
  }
}

// Función para mover carpetas usando OAuth
export async function moveFolderToFolder(folderId: string, targetFolderId: string) {
  try {
    console.log(`📁 [OAuth Drive] Moviendo carpeta ${folderId} a carpeta ${targetFolderId}`);

    const driveClient = await getOAuthClient();

    // Obtener padres actuales
    const folder = await driveClient.files.get({
      fileId: folderId,
      fields: 'parents',
    });

    // Mover carpeta
    const previousParents = folder.data.parents?.join(',');
    if (previousParents) {
      await driveClient.files.update({
        fileId: folderId,
        removeParents: previousParents,
        addParents: targetFolderId,
        fields: 'id, parents',
      });
    }

    console.log(`✅ [OAuth Drive] Carpeta movida exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ [OAuth Drive] Error moviendo carpeta:', error);
    throw error;
  }
}

// Función para eliminar archivos usando OAuth
export async function deleteFileFromDrive(fileId: string) {
  try {
    console.log(`🗑️ [OAuth Drive] Eliminando archivo: ${fileId}`);

    const driveClient = await getOAuthClient();

    await driveClient.files.delete({
      fileId: fileId,
    });

    console.log(`✅ [OAuth Drive] Archivo eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ [OAuth Drive] Error eliminando archivo:', error);
    throw error;
  }
}

// Alias exports for backward compatibility
export const moveFileToFolderOAuth = moveFileToFolder;
export const moveFolderToFolderOAuth = moveFolderToFolder; 