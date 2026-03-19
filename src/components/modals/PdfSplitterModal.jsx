import React, { useState, useEffect } from 'react';
import { X, Scissors, Upload, FileText, Download, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PdfSplitterModal() {
  const { isPdfToolOpen, setIsPdfToolOpen } = useApp();
  const [file, setFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [libLoaded, setLibLoaded] = useState(false);

  useEffect(() => {
    if (isPdfToolOpen && !window.PDFLib) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
      script.onload = () => setLibLoaded(true);
      document.body.appendChild(script);
    } else if (isPdfToolOpen && window.PDFLib) {
      setLibLoaded(true);
    }
  }, [isPdfToolOpen]);

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      if (libLoaded) {
        const ab = await f.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(ab);
        setTotalPages(doc.getPageCount());
      }
    } else {
      alert('กรุณาเลือกไฟล์ PDF เท่านั้น');
    }
  };

  const parsePageRanges = (rangeStr, total) => {
    const pages = new Set();
    rangeStr.split(',').map(p => p.trim()).forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) if (i >= 1 && i <= total) pages.add(i - 1);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= total) pages.add(page - 1);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || !pageRange || !libLoaded) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = window.PDFLib;
      const ab = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(ab);
      const newDoc = await PDFDocument.create();
      const indices = parsePageRanges(pageRange, totalPages);
      if (indices.length === 0) { alert('ระบุเลขหน้าไม่ถูกต้อง'); return; }
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach(page => newDoc.addPage(page));
      const bytes = await newDoc.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `Split_${file.name}`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setIsPdfToolOpen(false);
    } catch (err) { console.error(err); alert('เกิดข้อผิดพลาดในการตัดไฟล์'); }
    finally { setIsProcessing(false); }
  };

  if (!isPdfToolOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass-lg w-full max-w-md p-6 relative animate-scale-in">
        <button onClick={() => setIsPdfToolOpen(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600">
          <X size={22} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-pink-100 p-3 rounded-xl"><Scissors className="w-5 h-5 text-pink-600" /></div>
          <div>
            <h3 className="font-display text-lg font-bold text-surface-900">ตัดไฟล์ PDF</h3>
            <p className="text-xs text-surface-500">เลือกเฉพาะหน้าที่ต้องการ</p>
          </div>
        </div>

        {!libLoaded ? (
          <div className="text-center py-8 text-surface-500"><Loader2 className="animate-spin w-8 h-8 mx-auto mb-2" />กำลังโหลดเครื่องมือ...</div>
        ) : (
          <div className="space-y-4">
            <div className="upload-zone !p-4 !h-auto">
              <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {file ? (
                <div className="flex items-center gap-2 text-brand-700 font-medium"><FileText size={18} /> {file.name}</div>
              ) : (
                <div className="text-center"><Upload className="w-8 h-8 text-surface-400 mx-auto mb-1" /><span className="text-sm text-surface-500">เลือกไฟล์ PDF</span></div>
              )}
            </div>

            {file && (
              <div className="bg-brand-50 p-3 rounded-xl text-sm text-brand-800 flex justify-between">
                <span>จำนวนหน้าทั้งหมด:</span><span className="font-bold">{totalPages} หน้า</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">ระบุหน้าที่ต้องการ</label>
              <input type="text" placeholder="เช่น 1, 3-5, 8" value={pageRange} onChange={e => setPageRange(e.target.value)} className="input-field" />
              <p className="text-xs text-surface-400 mt-1">ใช้ , คั่น หรือ - สำหรับช่วง</p>
            </div>

            <button onClick={handleSplit} disabled={isProcessing || !file || !pageRange}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              ตัดไฟล์และดาวน์โหลด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
