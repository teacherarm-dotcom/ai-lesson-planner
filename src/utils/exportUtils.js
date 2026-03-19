/**
 * Open a print-ready window for PDF saving
 */
export function printToPdf(title, contentHtml) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('กรุณาอนุญาตให้เปิด Pop-up เพื่อพิมพ์เอกสาร (Allow Pop-ups)');
    return;
  }

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 20px; line-height: 1.6; }
          h1 { font-size: 20px; text-align: center; margin-bottom: 20px; }
          h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          h3 { font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
          h4 { font-size: 15px; margin-top: 12px; margin-bottom: 6px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 15px; font-size: 14px; }
          th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: left; }
          ul { margin: 0; padding-left: 20px; }
          .text-center { text-align: center; }
          .no-print { margin-bottom: 20px; padding: 10px; background: #eee; text-align: center; border-bottom: 1px solid #ddd; }
          .btn { background: #227bea; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
          .btn:hover { background: #1a64d7; }
          @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
            @page { margin: 1cm; size: A4; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn" onclick="window.print()">📄 บันทึกเป็น PDF (Save as PDF)</button>
          <p style="margin-top:5px; font-size:12px; color:#666;">(หากหน้าต่างพิมพ์ไม่ขึ้นอัตโนมัติ ให้กดปุ่มด้านบน)</p>
        </div>
        <h1>${title}</h1>
        ${contentHtml}
        <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Create and download a Word document (.doc)
 */
export function createWordDoc(title, contentHtml) {
  const fullHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'TH Sarabun New', 'Sarabun', sans-serif; font-size: 16pt; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 5px; vertical-align: top; }
        th { background-color: #f2f2f2; }
        ul { margin: 0; padding-left: 20px; }
        h1 { font-size: 20pt; }
        h2 { font-size: 18pt; }
        h3 { font-size: 16pt; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${contentHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[\/\s]/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
