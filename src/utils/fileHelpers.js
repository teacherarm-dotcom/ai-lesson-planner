/**
 * Extract file data for AI processing
 * Supports: images, PDFs, Word documents
 */
export async function extractFileData(file) {
  if (!file) throw new Error('No file selected');

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';
  const isDocx = file.name.endsWith('.docx') || file.name.endsWith('.doc');

  if (!isImage && !isPdf && !isDocx) {
    throw new Error('กรุณาอัปโหลดไฟล์ รูปภาพ, PDF หรือ Word (.docx) เท่านั้น');
  }

  const fileData = { type: '', name: file.name, mimeType: file.type };

  if (isDocx) {
    if (!window.mammoth) throw new Error('เครื่องมืออ่านไฟล์ Word ยังไม่พร้อม กรุณารอสักครู่');
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    fileData.type = 'word';
    fileData.extractedText = result.value;
  } else {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        fileData.type = isImage ? 'image' : 'pdf';
        fileData.data = reader.result;
        resolve();
      };
      reader.onerror = () => reject(new Error('File reading failed'));
    });
  }

  return fileData;
}

/**
 * Prepare file data for AI provider consumption
 * Converts internal file format → provider-compatible content objects
 */
export function prepareFileForAI(fileData, label = '') {
  if (!fileData) return null;

  if (fileData.type === 'word') {
    return {
      type: 'word',
      data: label
        ? `\n\n--- ${label} ---\n${fileData.extractedText}`
        : fileData.extractedText
    };
  }

  if (fileData.type === 'image') {
    return {
      type: 'image',
      data: fileData.data,
      mimeType: fileData.mimeType || 'image/jpeg'
    };
  }

  if (fileData.type === 'pdf') {
    return {
      type: 'pdf',
      data: fileData.data,
      mimeType: 'application/pdf'
    };
  }

  return null;
}
