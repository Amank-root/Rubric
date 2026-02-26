
/**
 * Extracts text from common file types (PDF, DOCX, TXT).
 * Uses dynamic imports to ensure client-side only execution for heavy libraries.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  // Defensive check for server-side environments
  if (typeof window === 'undefined') {
    return "Error: File parsing is only supported in the browser.";
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  try {
    switch (extension) {
      case 'txt':
        return await file.text();
      case 'docx':
        return await extractTextFromDocx(file);
      case 'pdf':
        return await extractTextFromPdf(file);
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }
  } catch (error: any) {
    console.error(`Error extracting text from ${file.name}:`, error);
    throw new Error(`Failed to read file contents: ${error.message}`);
  }
}

async function extractTextFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const pdfjs = await import('pdfjs-dist');
    
    // Using unpkg as a reliable CDN for the worker. 
    // PDF.js v4+ requires the .mjs extension for ES module support.
    const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => 'str' in item ? item.str : '')
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageErr) {
        console.warn(`Error reading page ${i}:`, pageErr);
      }
    }

    if (!fullText.trim()) {
      throw new Error("No readable text found in PDF. The file might be scanned, encrypted, or empty.");
    }

    return fullText;
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    // Generic fallback if worker loading fails
    if (error.message?.includes('worker')) {
      throw new Error("PDF processing failed due to a worker initialization issue. Please try a different browser or file format.");
    }
    throw new Error(error.message || 'The PDF document could not be processed.');
  }
}
