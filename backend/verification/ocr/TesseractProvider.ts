import { createWorker } from 'tesseract.js';
import { OcrProvider } from './OcrProvider';

export class TesseractProvider implements OcrProvider {
  private worker: any = null;

  async initialize(): Promise<void> {
    if (!this.worker) {
      this.worker = await createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
  }

  async extractText(filePath: string): Promise<string> {
    await this.initialize();
    
    try {
      const { data: { text } } = await this.worker.recognize(filePath);
      return text.trim();
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
