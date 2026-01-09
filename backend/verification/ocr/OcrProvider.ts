export interface OcrProvider {
  extractText(filePath: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}
