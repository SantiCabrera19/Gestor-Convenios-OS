import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { getStorageProvider } from "@/lib/storage";

export class DocumentGenerator {
  /**
   * Genera un documento .docx reemplazando las variables con los datos proporcionados.
   * @param templatePath Ruta o ID del archivo de plantilla en el storage.
   * @param data Objeto con los datos para reemplazar en la plantilla.
   * @returns Buffer del documento generado.
   */
  static async generateDocument(templatePath: string, data: Record<string, any>): Promise<Buffer> {
    try {
      // 1. Obtener el archivo de plantilla del storage
      const storage = getStorageProvider();
      
      // Si templatePath es una URL completa, intentamos extraer el ID
      // Si no, asumimos que es el ID o Path directo
      let fileId = templatePath;
      const extractedId = storage.getFileIdFromUrl ? storage.getFileIdFromUrl(templatePath) : null;
      if (extractedId) {
          fileId = extractedId;
      }

      const content = await storage.getFileContent(fileId);

      // 2. Cargar el contenido en PizZip
      const zip = new PizZip(content);

      // 3. Inicializar Docxtemplater
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // 4. Renderizar el documento con los datos
      doc.render(data);

      // 5. Generar el buffer de salida
      const output = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });

      return output;

    } catch (error) {
      console.error("Error generando documento:", error);
      throw new Error("Falló la generación del documento");
    }
  }
}
