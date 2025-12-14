import fs from 'fs/promises';
import path from 'path';
import { IStorageProvider, StoredFile } from './types';

export class FileSystemProvider implements IStorageProvider {
  private uploadDir: string;

  constructor(basePath: string = 'public/uploads') {
    // Definimos dónde se guardarán los archivos. 
    // Usamos 'public' para que sean accesibles vía web si es necesario,
    // o una carpeta privada si queremos restringir acceso.
    this.uploadDir = path.join(process.cwd(), basePath);
  }

  async saveFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId?: string
  ): Promise<StoredFile> {
    // 1. Determinar directorio destino
    let targetDir = this.uploadDir;
    
    if (folderId) {
      // Si nos pasan un folderId, asumimos que es el path absoluto de la carpeta creada previamente
      // (o relativo si así se implementó). En createFolder devolvemos el path absoluto como ID.
      targetDir = folderId;
    }

    // Asegurar que la carpeta existe (por si acaso)
    try {
      await fs.access(targetDir);
    } catch {
      await fs.mkdir(targetDir, { recursive: true });
    }

    // 2. Generar ruta única para evitar colisiones
    // Agregamos timestamp para que "convenio.docx" no sobrescriba al anterior
    const uniqueName = `${Date.now()}-${fileName}`;
    const filePath = path.join(targetDir, uniqueName);

    // 3. Escribir el archivo en el disco del servidor
    await fs.writeFile(filePath, fileBuffer);

    // 4. Retornar la info. 
    // Calculamos la URL relativa a 'public' para que sea accesible
    // Asumimos que uploadDir está dentro de 'public' o es 'public/uploads'
    // Si targetDir es '.../public/uploads/carpeta1', relative es 'uploads/carpeta1'
    // Necesitamos que empiece con /
    
    // Truco: Encontrar la parte relativa a 'public'
    const publicIndex = filePath.indexOf('public');
    let publicUrl = '';
    
    if (publicIndex !== -1) {
        const relativeToPublic = filePath.substring(publicIndex + 6); // +6 por 'public'
        publicUrl = relativeToPublic.replace(/\\/g, '/');
    } else {
        // Fallback si no está en public
        publicUrl = filePath;
    }

    return {
      id: filePath, // En FS, el ID es el path
      name: fileName,
      webViewLink: publicUrl,
      downloadLink: publicUrl,
      mimeType: mimeType,
    };
  }

  async createFolder(
    folderName: string,
    parentFolderId?: string
  ): Promise<StoredFile> {
    // Si parentFolderId es provisto, asumimos que es un path relativo dentro de uploadDir
    // Si no, es en la raíz de uploadDir
    
    // Nota: En FS, 'parentFolderId' debería ser el path absoluto o relativo seguro.
    // Para simplificar, si parentFolderId es un path absoluto que empieza con uploadDir, lo usamos.
    // Si no, asumimos que es relativo a uploadDir.
    
    let targetDir = this.uploadDir;
    
    if (parentFolderId) {
        // Verificación básica de seguridad para evitar salir del directorio
        if (parentFolderId.startsWith(this.uploadDir)) {
            targetDir = parentFolderId;
        } else {
            // Si es un ID arbitrario o nombre, lo tratamos como subcarpeta
            // Esto es una simplificación. En un sistema real, mapearíamos IDs a Paths.
            // Aquí asumimos que si pasamos un "ID" de carpeta, es el path completo.
            // O si es null, es root.
            // Para mantener compatibilidad con Drive que usa IDs opacos, 
            // el "ID" que devolvemos en createFolder debe ser reutilizable aquí.
            // En saveFile devolvemos filePath como ID.
            targetDir = parentFolderId; 
        }
    }

    const newFolderPath = path.join(targetDir, folderName);

    try {
      await fs.access(newFolderPath);
    } catch {
      await fs.mkdir(newFolderPath, { recursive: true });
    }

    // URL pública
    const relativePath = path.relative(this.uploadDir, newFolderPath);
    const publicUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

    return {
      id: newFolderPath,
      name: folderName,
      webViewLink: publicUrl,
      downloadLink: publicUrl,
      mimeType: 'application/vnd.google-apps.folder', // MimeType simbólico
    };
  }

  async moveFile(fileId: string, targetFolderId: string): Promise<void> {
    // En FS, fileId es el path absoluto actual.
    // targetFolderId es el path absoluto de la carpeta destino.
    
    const fileName = path.basename(fileId);
    const newPath = path.join(targetFolderId, fileName);

    // Asegurar que el destino existe
    try {
      await fs.access(targetFolderId);
    } catch {
      await fs.mkdir(targetFolderId, { recursive: true });
    }

    await fs.rename(fileId, newPath);
    
    // Nota: Si el ID cambia (porque el path cambia), esto podría ser problemático 
    // si el sistema depende de que el ID sea inmutable.
    // En Drive el ID es inmutable. En FS el ID es el path.
    // Si movemos el archivo, su ID cambia.
    // El llamador debería actualizar la referencia si es necesario.
    // Pero en este sistema, 'document_path' es una URL, no el ID interno.
    // Si movemos el archivo, la URL pública también cambia.
    // Esto es una limitación de usar Path como ID.
  }

  getFileIdFromUrl(url: string): string | null {
    // Asumimos que la URL empieza con /uploads/ si usamos la configuración por defecto
    // Si la URL es completa (http...), habría que parsearla.
    // Aquí asumimos path relativo al servidor web.
    
    // TODO: Hacer esto más robusto detectando el prefijo configurado.
    // Por ahora hardcodeamos '/uploads/' que es lo que usamos en saveFile.
    
    if (url.startsWith('/uploads/')) {
        const relativePath = url.substring(9); // '/uploads/'.length
        return path.join(this.uploadDir, relativePath);
    }
    return null;
  }

  getSystemFolderId(type: 'root' | 'pending' | 'approved' | 'rejected' | 'archived'): string {
      // Mapeamos tipos a subcarpetas
      // root -> uploadDir
      // pending -> uploadDir/pendientes
      // etc.
      
      if (type === 'root') return this.uploadDir;
      
      const folderNameMap: Record<string, string> = {
          pending: 'pendientes',
          approved: 'aprobados',
          rejected: 'rechazados',
          archived: 'archivados'
      };
      
      const folderName = folderNameMap[type] || type;
      const folderPath = path.join(this.uploadDir, folderName);
      
      // Aseguramos que exista (lazy creation)
      // Nota: Esto es síncrono o deberíamos hacerlo async?
      // getSystemFolderId es síncrono en la firma (string).
      // Así que no podemos hacer await aquí.
      // Asumimos que saveFile/moveFile crearán la carpeta si no existe,
      // o la creamos en el constructor, o usamos mkdirSync (bloqueante pero seguro).
      
      try {
          // Usamos sync para cumplir con la firma
          const fsSync = require('fs');
          if (!fsSync.existsSync(folderPath)) {
              fsSync.mkdirSync(folderPath, { recursive: true });
          }
      } catch (e) {
          console.error('Error creando carpeta de sistema:', e);
      }
      
      return folderPath;
  }

  async getFileContent(fileId: string): Promise<Buffer> {
    // En FS, fileId es el path absoluto al archivo
    try {
      return await fs.readFile(fileId);
    } catch (error) {
      console.error(`Error reading file at ${fileId}:`, error);
      throw new Error(`No se pudo leer el archivo: ${fileId}`);
    }
  }
}
