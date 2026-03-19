import React from 'react';
import { X, AlertOctagon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ErrorPopup() {
  const { error, setError } = useApp();
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass-lg w-full max-w-sm p-6 animate-scale-in text-center relative">
        <button onClick={() => setError(null)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition">
          <X size={20} />
        </button>
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertOctagon className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h3 className="font-display text-lg font-bold text-surface-900 mb-2">แจ้งเตือน</h3>
        <p className="text-surface-600 mb-6 whitespace-pre-wrap text-sm leading-relaxed">{error}</p>
        <button onClick={() => setError(null)} className="btn-danger w-full text-sm">
          รับทราบ
        </button>
      </div>
    </div>
  );
}
