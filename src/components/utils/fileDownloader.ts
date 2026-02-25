import { Document, Paragraph, TextRun, Packer } from 'docx';

export const downloadFile = (
  fileData: string, 
  fileName: string, 
  fileType: string
) => {
  try {
    // Create blob from base64 data
    const base64Data = fileData.split(',')[1]; // Remove data:type;base64, prefix
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: fileType });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('File download error:', error);
    return false;
  }
};

// Convert text content to Word document and download
export const downloadAsWord = async (
  textContent: string,
  fileName: string
) => {
  try {
    // Split text into paragraphs
    const lines = textContent.split('\n');
    
    // Create paragraphs for the document
    const paragraphs = lines.map(line => {
      return new Paragraph({
        children: [
          new TextRun({
            text: line || ' ', // Empty line if blank
            font: 'Arial',
            size: 24, // 12pt
          }),
        ],
        spacing: {
          after: 120,
        },
      });
    });
    
    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });
    
    // Generate blob
    const blob = await Packer.toBlob(doc);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace(/\.(txt|pdf)$/i, '.docx');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Word download error:', error);
    return false;
  }
};

export const downloadDefaultFile = (materialTitle: string) => {
  // For default materials without actual files, create a text file with material info
  const content = `${materialTitle}\n\n이 자료는 N Study Hub에서 제공되는 교육 자료입니다.\n다운로드 날짜: ${new Date().toLocaleDateString('ko-KR')}\n\n실제 학습 자료는 별도로 제공될 예정입니다.`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${materialTitle.replace(/[<>:"/\\|?*]/g, '_')}.txt`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return true;
};