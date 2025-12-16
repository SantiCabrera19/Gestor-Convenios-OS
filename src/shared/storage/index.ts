import { IStorageProvider } from './types';
import { FileSystemProvider } from './file-system-provider';
import { GoogleDriveProvider } from './google-drive-provider';

export * from './types';
export * from './file-system-provider';
export * from './google-drive-provider';

export function getStorageProvider(): IStorageProvider {
  const providerType = process.env.STORAGE_PROVIDER || 'local'; // 'local' | 'drive'

  if (providerType === 'drive') {
    console.log('📦 Usando proveedor de almacenamiento: Google Drive');
    return new GoogleDriveProvider();
  }

  console.log('📦 Usando proveedor de almacenamiento: Sistema de Archivos Local');
  return new FileSystemProvider();
}
