import { google } from 'googleapis';
import { Readable } from 'stream';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { IStorageProvider, StoredFile } from './types';

// Configuración de las carpetas (Hardcoded por ahora, idealmente en DB o Env)
export const DRIVE_FOLDERS = {
  ROOT: '1od2SuLoJPgxS5OTyps_UhCEvhvhWT3mz',
  PENDING: '1IwXiatPJ-j98oC7XKrd9xK7VF52fVNaJ',
  APPROVED: '19BAZjx93AsHZ45s3U6afISMQJy5zdzPm',
  REJECTED: '16JY2aSOp57qn7Ow4BBRZqqq1xK_kv7PQ',
  ARCHIVED: '15LlGgNqCVMhjcpZBJUSVKvq4AwkRFSr1',
} as const;

export class GoogleDriveProvider implements IStorageProvider {
  
  private async getOAuthClient() {
    // Para esta operación específica, necesitamos un cliente con privilegios de administrador
    // para poder leer los tokens de CUALQUIER usuario.
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

    if (adminError || !adminProfiles || adminProfiles.length === 0) {
      throw new Error('No se encontró ningún perfil de administrador en el sistema para autenticar Drive.');
    }

    const adminUserIds = adminProfiles.map(p => p.id);

    // 2. De esa lista de admins, encontrar el PRIMERO que tenga un token
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from('google_oauth_tokens')
      .select('*')
      .in('user_id', adminUserIds)
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      throw new Error(`Error al buscar el token de OAuth: ${tokenError.message}`);
    }

    if (!tokens) {
      throw new Error(
        '❌ Ninguno de los administradores tiene un token de Google Drive válido conectado.'
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_OAUTH_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at ? new Date(tokens.expires_at).getTime() : null,
    });

    // Manejar la renovación automática del token
    if (tokens.expires_at) {
      const now = new Date();
      const expiryDate = new Date(tokens.expires_at);
      const buffer = 5 * 60 * 1000; // 5 minutos

      if (expiryDate.getTime() < now.getTime() + buffer) {
        console.log('🔄 [OAuth] Token expirado o a punto de expirar, renovando...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        await supabaseAdmin
          .from('google_oauth_tokens')
          .update({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || tokens.refresh_token,
            expires_at: credentials.expiry_date
              ? new Date(credentials.expiry_date).toISOString()
              : null,
          })
          .eq('user_id', tokens.user_id);
      }
    }

    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string = DRIVE_FOLDERS.PENDING
  ): Promise<StoredFile> {
    try {
      const driveClient = await this.getOAuthClient();
      
      const fileMetadata: any = {
        name: fileName,
        parents: [folderId],
      };

      const stream = Readable.from(fileBuffer);
      const media = {
        mimeType: mimeType,
        body: stream,
      };

      const response = await driveClient.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, webViewLink, webContentLink',
      });

      if (!response.data.id) {
        throw new Error('Google Drive no devolvió un ID de archivo.');
      }

      return {
        id: response.data.id,
        name: fileName,
        webViewLink: response.data.webViewLink || '',
        downloadLink: response.data.webContentLink || '',
        mimeType: mimeType,
      };
    } catch (error) {
      console.error('❌ [GoogleDriveProvider] Error guardando archivo:', error);
      throw error;
    }
  }

  async createFolder(
    folderName: string,
    parentFolderId: string = DRIVE_FOLDERS.PENDING
  ): Promise<StoredFile> {
    try {
      const driveClient = await this.getOAuthClient();
      
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      };

      const response = await driveClient.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink',
      });

      if (!response.data.id) {
        throw new Error('Google Drive no devolvió un ID de carpeta.');
      }

      return {
        id: response.data.id,
        name: folderName,
        webViewLink: response.data.webViewLink || '',
        mimeType: 'application/vnd.google-apps.folder',
      };
    } catch (error) {
      console.error('❌ [GoogleDriveProvider] Error creando carpeta:', error);
      throw error;
    }
  }

  async moveFile(fileId: string, targetFolderId: string): Promise<void> {
    try {
      const driveClient = await this.getOAuthClient();
      
      // Obtener padres actuales
      const file = await driveClient.files.get({
        fileId,
        fields: 'parents',
      });

      const previousParents = file.data.parents?.join(',');
      if (previousParents) {
        await driveClient.files.update({
          fileId,
          removeParents: previousParents,
          addParents: targetFolderId,
          fields: 'id, parents',
        });
      }
    } catch (error) {
      console.error('❌ [GoogleDriveProvider] Error moviendo archivo:', error);
      throw error;
    }
  }

  getFileIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    // Patrón para archivos: .../d/ID/...
    const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) return fileMatch[1];
    
    // Patrón para carpetas: .../folders/ID...
    const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    
    return null;
  }

  getSystemFolderId(type: 'root' | 'pending' | 'approved' | 'rejected' | 'archived'): string {
      const map = {
          root: DRIVE_FOLDERS.ROOT,
          pending: DRIVE_FOLDERS.PENDING,
          approved: DRIVE_FOLDERS.APPROVED,
          rejected: DRIVE_FOLDERS.REJECTED,
          archived: DRIVE_FOLDERS.ARCHIVED
      };
      return map[type] || DRIVE_FOLDERS.ROOT;
  }

  async deleteFile(fileId: string): Promise<void> {
    const driveClient = await this.getOAuthClient();
    await driveClient.files.delete({ fileId });
  }

  async getFileContent(fileId: string): Promise<Buffer> {
    try {
      const driveClient = await this.getOAuthClient();
      const response = await driveClient.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error(`❌ [GoogleDriveProvider] Error leyendo archivo ${fileId}:`, error);
      throw error;
    }
  }
}
