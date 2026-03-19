import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useApp } from '../../context/AppContext';

export default function ApiKeyModal() {
  const { isKeyModalOpen, setIsKeyModalOpen } = useApp();
  const { providerId, apiKey, providers, saveSettings } = useAI();

  const [selectedProvider, setSelectedProvider] = useState(providerId);
  const [inputKey, setInputKey] = useState('');
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (isKeyModalOpen) {
      setSelectedProvider(providerId);
      setInputKey(apiKey || '');
    }
  }, [isKeyModalOpen, providerId, apiKey]);

  const currentProviderMeta = providers.find(p => p.id === selectedProvider);

  const handleSave = async () => {
    if (!inputKey.trim()) return;
    setValidating(true);
    // Save immediately — validation is optional
    setTimeout(() => {
      saveSettings(selectedProvider, inputKey.trim());
      setValidating(false);
      setIsKeyModalOpen(false);
    }, 300);
  };

  if (!isKeyModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass-lg w-full max-w-lg overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">ตั้งค่า AI Provider</h3>
                <p className="text-xs text-white/70">เลือกค่าย AI และใส่ API Key ของท่าน</p>
              </div>
            </div>
            {apiKey && (
              <button onClick={() => setIsKeyModalOpen(false)} className="text-white/60 hover:text-white transition p-1">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">เลือกค่าย AI</label>
            <div className="grid grid-cols-3 gap-2">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProvider(p.id);
                    if (p.id !== providerId) setInputKey('');
                    else setInputKey(apiKey || '');
                  }}
                  className={`
                    relative px-3 py-3 rounded-xl border-2 text-center transition-all duration-200
                    ${selectedProvider === p.id
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50'}
                  `}
                >
                  {selectedProvider === p.id && (
                    <CheckCircle size={14} className="absolute top-1.5 right-1.5 text-brand-500" />
                  )}
                  <span className="text-sm font-bold block">{p.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-surface-400 block mt-0.5">{p.name.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Help Box */}
          {currentProviderMeta && (
            <div className="bg-amber-50 text-amber-800 text-xs p-4 rounded-xl border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">{currentProviderMeta.helpText}</p>
                  <a
                    href={currentProviderMeta.helpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-900 font-bold underline"
                  >
                    <ExternalLink size={12} /> เปิดหน้าขอ API Key
                  </a>
                  <p className="mt-2 text-amber-600">
                    ระบบจะบันทึก Key ไว้ในเครื่องของท่านเท่านั้น ปลอดภัย 100%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-1.5">API Key</label>
            <input
              type="password"
              placeholder={currentProviderMeta?.placeholder || 'Enter API Key...'}
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="input-field font-mono text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {apiKey && (
              <button onClick={() => setIsKeyModalOpen(false)} className="btn-ghost text-sm">
                ยกเลิก
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!inputKey.trim() || validating}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating ? '⏳ กำลังบันทึก...' : '💾 บันทึก API Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
