import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Upload, FileText, FileType, Loader2, CheckCircle } from 'lucide-react';

// ========================================
// Markdown Table Renderer
// ========================================
export function MarkdownTableRenderer({ content }) {
  if (!content) return null;
  const cleaned = content.replace(/```markdown/g, '').replace(/```/g, '').trim();
  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sepIdx = lines.findIndex(line => line.startsWith('|') && line.includes('---'));

  if (sepIdx === -1 || sepIdx === 0) {
    return <div className="p-4 bg-surface-50 text-surface-700 whitespace-pre-wrap font-mono text-sm rounded-xl">{cleaned}</div>;
  }

  const headerLine = lines[sepIdx - 1];
  const headers = headerLine.split('|').filter(c => c.trim() !== '').map(c => c.trim());
  const bodyLines = lines.slice(sepIdx + 1).filter(line => line.startsWith('|'));
  const rows = bodyLines.map(line =>
    line.split('|').filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map(c => c ? c.trim() : '')
  );

  return (
    <div className="overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-bold text-surface-700 uppercase tracking-wider border-r border-surface-100 last:border-r-0 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-surface-100">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-surface-50/50'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 text-sm text-surface-700 border-r border-surface-100 last:border-r-0 align-top">
                  {cell.split(/<br\s*\/?>/i).map((line, i) => (
                    <div key={i} className="mb-1 last:mb-0"><ReactMarkdown>{line}</ReactMarkdown></div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========================================
// Loading Overlay
// ========================================
export function LoadingOverlay({ text = 'กำลังประมวลผล...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-brand-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-surface-600 font-medium animate-pulse text-sm">{text}</p>
    </div>
  );
}

// ========================================
// File Upload Zone
// ========================================
export function UploadZone({ file, onFileChange, label, accept = 'image/*,application/pdf,.doc,.docx', color = 'brand', className = '' }) {
  const colorMap = {
    brand: { border: 'border-brand-300', bg: 'bg-brand-50', hover: 'hover:bg-brand-100', text: 'text-brand-700', iconBg: 'bg-brand-100' },
    purple: { border: 'border-purple-300', bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-700', iconBg: 'bg-purple-100' },
    green: { border: 'border-emerald-300', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-700', iconBg: 'bg-emerald-100' },
    pink: { border: 'border-pink-300', bg: 'bg-pink-50', hover: 'hover:bg-pink-100', text: 'text-pink-700', iconBg: 'bg-pink-100' },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed ${c.border} rounded-2xl ${c.bg} ${c.hover} transition-all duration-300 cursor-pointer group ${className}`}>
      <input type="file" accept={accept} onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      {file ? (
        <div className="text-center">
          <div className={`${c.iconBg} p-3 rounded-full mx-auto mb-2 w-fit`}>
            {file.type === 'image' ? (
              <img src={file.data} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
            ) : file.type === 'pdf' ? (
              <FileText className={`w-8 h-8 ${c.text}`} />
            ) : (
              <FileType className={`w-8 h-8 ${c.text}`} />
            )}
          </div>
          <p className={`text-sm font-bold ${c.text} truncate max-w-[200px]`}>{file.name}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 justify-center">
            <CheckCircle size={12} /> แนบไฟล์แล้ว
          </p>
        </div>
      ) : (
        <div className="text-center">
          <Upload className={`w-10 h-10 ${c.text} opacity-40 mx-auto mb-2 group-hover:opacity-60 transition`} />
          <p className={`text-sm font-semibold ${c.text}`}>{label || 'คลิกเพื่อแนบไฟล์'}</p>
          <p className="text-xs text-surface-400 mt-1">รองรับ รูปภาพ, PDF, Word</p>
        </div>
      )}
    </div>
  );
}

// ========================================
// Auto Mode Badge
// ========================================
export function AutoModeBadge({ moduleName }) {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-slide-up">
      <div className="bg-white p-3 rounded-full shadow-sm mb-3 mx-auto w-fit text-emerald-600">
        <CheckCircle size={28} />
      </div>
      <h3 className="text-emerald-800 font-display font-bold text-lg mb-1">ข้อมูลพร้อมใช้งาน!</h3>
      <p className="text-emerald-700 text-sm">
        รับข้อมูลอัตโนมัติจาก {moduleName}
      </p>
    </div>
  );
}

// ========================================
// Result Header Bar (with export buttons)
// ========================================
export function ResultHeader({ title, count, onRegenerate, onExportWord, onExportPdf, requireRegistration }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-200 gap-3">
      <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
        <CheckCircle size={16} />
        <span>{title} {count ? `(${count} หน่วย)` : ''}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {onRegenerate && (
          <button onClick={onRegenerate} className="btn-secondary !py-1.5 !px-3 !text-xs !text-emerald-700 !border-emerald-300 hover:!bg-emerald-50">
            🔄 สร้างใหม่
          </button>
        )}
        {onExportWord && (
          <button onClick={() => requireRegistration(onExportWord)} className="btn-primary !py-1.5 !px-3 !text-xs">
            📄 Word
          </button>
        )}
        {onExportPdf && (
          <button onClick={() => requireRegistration(onExportPdf)} className="btn-danger !py-1.5 !px-3 !text-xs">
            📑 PDF
          </button>
        )}
      </div>
    </div>
  );
}

// ========================================
// Section Card Wrapper
// ========================================
export function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-glass p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

// ========================================
// Module Header
// ========================================
export function ModuleHeader({ emoji, title, subtitle }) {
  return (
    <div className="mb-6 pb-4 border-b border-surface-100">
      <h2 className="font-display text-2xl font-bold text-surface-800 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span> {title}
      </h2>
      {subtitle && <p className="text-surface-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

// ========================================
// Next Step Banner
// ========================================
export function NextStepBanner({ label, onClick, description }) {
  return (
    <div className="mt-8 text-center bg-surface-50 p-6 rounded-2xl border border-surface-200">
      <h4 className="text-surface-700 font-display font-bold mb-3">ขั้นตอนต่อไป</h4>
      <button onClick={onClick} className="btn-primary !px-8 !py-3 !text-base mx-auto animate-bounce shadow-brand">
        {label} →
      </button>
      {description && <p className="text-xs text-surface-400 mt-2">{description}</p>}
    </div>
  );
}
