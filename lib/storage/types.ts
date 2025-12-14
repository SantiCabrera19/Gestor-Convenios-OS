export interface StoredFile {
  id: string;
  name: string;
  webViewLink?: string; // URL para ver el archivo (ej. Google Drive link)
  downloadLink?: string; // URL para descargar (o path local relativo)
  mimeType: string;
}

export interface IStorageProvider {
  /**
   * Sube o guarda un archivo en el almacenamiento.
   * @param fileBuffer El contenido del archivo en bytes.
   * @param fileName El nombre deseado para el archivo.
   * @param mimeType El tipo de archivo (ej. application/pdf).
   * @param folderId (Opcional) ID de carpeta para organizar (usado en Drive).
   */
  saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<StoredFile>;

  /**
   * Crea una carpeta para organizar archivos.
   * @param folderName Nombre de la carpeta.
   * @param parentFolderId (Opcional) ID de la carpeta padre.
   */
  createFolder?(
    folderName: string,
    parentFolderId?: string
  ): Promise<StoredFile>;

  /**
   * (Opcional) Mueve un archivo o carpeta a otra ubicación.
   */
  moveFile?(fileId: string, targetFolderId: string): Promise<void>;

  /**
   * Obtiene el ID del archivo a partir de su URL pública.
   */
  getFileIdFromUrl?(url: string): string | null;

  /**
   * Obtiene el ID (o path) de una carpeta del sistema.
   */
  getSystemFolderId?(type: 'root' | 'pending' | 'approved' | 'rejected' | 'archived'): string;

  /**
   * (Opcional) Elimina un archivo.
   */
  deleteFile?(fileId: string): Promise<void>;

  /**
   * Obtiene el contenido binario de un archivo.
   * @param fileId ID o Path del archivo.
   */
  getFileContent(fileId: string): Promise<Buffer>;
}
