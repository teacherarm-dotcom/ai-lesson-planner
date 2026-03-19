import React from 'react';
import { BookOpen, Key, Facebook, Youtube, Instagram, Globe, ChevronRight, Menu, X, Scissors } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';

const MENU_ITEMS = [
  { id: 'analysis', label: 'วิเคราะห์งาน/หน่วยการเรียนรู้', emoji: '📊' },
  { id: 'learning_outcomes', label: 'ผลลัพธ์การเรียนรู้ประจำหน่วย', emoji: '🎯' },
  { id: 'competencies', label: 'สมรรถนะประจำหน่วย', emoji: '⚡' },
  { id: 'objectives', label: 'จุดประสงค์เชิงพฤติกรรม', emoji: '✅' },
  { id: 'concept', label: 'สาระสำคัญ', emoji: '💡' },
];

export default function Sidebar() {
  const { activeMenu, setActiveMenu, isMobileMenuOpen, setIsMobileMenuOpen, setIsKeyModalOpen, setIsPdfToolOpen } = useApp();
  const { isReady, currentMeta } = useAI();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <span className="font-display font-bold text-lg flex items-center gap-2">
          <BookOpen size={20} /> AI แผนการสอน
        </span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-white/10 transition">
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen lg:h-auto
        w-72 shrink-0 transition-transform duration-300 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="bg-white rounded-none lg:rounded-2xl shadow-glass lg:shadow-lg h-full lg:h-auto lg:min-h-[calc(100vh-2rem)] flex flex-col overflow-y-auto">

          {/* Logo */}
          <div className="p-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 p-5 text-white shadow-brand">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent-500/20 rounded-full blur-xl" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl leading-tight">AI ช่วยทำ<br />แผนการสอน</h1>
                  <p className="text-xs text-brand-200 mt-0.5">Vocational Education AI Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 flex-1">
            <p className="px-3 mb-2 text-[10px] font-bold text-surface-400 uppercase tracking-widest">โมดูล</p>
            <div className="space-y-1">
              {MENU_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveMenu(item.id); setIsMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group text-left
                    ${activeMenu === item.id
                      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}
                  `}
                >
                  <span className="text-lg flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block truncate ${activeMenu === item.id ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-surface-400">Module {idx + 1}</span>
                  </div>
                  {activeMenu === item.id && <ChevronRight size={14} className="text-brand-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </nav>

          {/* Tools */}
          <div className="px-3 mt-4">
            <p className="px-3 mb-2 text-[10px] font-bold text-surface-400 uppercase tracking-widest">เครื่องมือ</p>
            <button
              onClick={() => setIsPdfToolOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-600 hover:bg-pink-50 hover:text-pink-700 transition text-sm font-medium"
            >
              <Scissors size={16} /> ตัดไฟล์ PDF
            </button>
            <a
              href="https://youtu.be/FjoTMFQMmnI"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-600 hover:bg-red-50 hover:text-red-700 transition text-sm font-medium no-underline"
            >
              <Youtube size={16} /> ดูวิธีใช้งาน
            </a>
          </div>

          {/* API Key & Footer */}
          <div className="p-4 mt-auto border-t border-surface-100">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className={`
                w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition shadow-sm
                ${isReady
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100 animate-pulse'}
              `}
            >
              <Key size={14} />
              {isReady ? `✅ ${currentMeta?.name || 'AI'} เชื่อมต่อแล้ว` : '⚠️ ตั้งค่า AI Provider'}
            </button>

            <div className="mt-4 text-center">
              <p className="text-[11px] text-surface-400 leading-relaxed">
                พัฒนาโดย <span className="font-semibold text-surface-600">นายอำนาจ เสมอวงศ์</span>
                <br />ศสพ.ภาคใต้
              </p>
              <div className="flex justify-center gap-3 mt-2">
                {[
                  { href: 'https://www.facebook.com/kruarm55', icon: <Facebook size={14} />, color: 'hover:text-blue-600' },
                  { href: 'https://www.youtube.com/@kruarm55', icon: <Youtube size={14} />, color: 'hover:text-red-600' },
                  { href: 'https://www.instagram.com/kruarm555', icon: <Instagram size={14} />, color: 'hover:text-pink-600' },
                  { href: 'http://www.kruarm.net', icon: <Globe size={14} />, color: 'hover:text-brand-600' },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noreferrer"
                    className={`text-surface-400 ${link.color} transition p-1`}>
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
