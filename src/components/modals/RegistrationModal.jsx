import React, { useState } from 'react';
import { X, Download, AlertCircle, Loader2, Mail, Building, GraduationCap, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PREFIXES = ['นาย', 'นาง', 'นางสาว'];
const CATEGORIES = ['สมรรถนะวิชาแกนกลาง', 'หมวดสมรรถนะวิชาชีพ'];
const REGIONS = ['ใต้', 'เหนือ', 'กลาง', 'ตะวันออกและกรุงเทพมหานคร', 'ตะวันออกเฉียงเหนือ'];
const PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี'
];

export default function RegistrationModal() {
  const { isRegModalOpen, setIsRegModalOpen, handleRegistrationComplete } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    email: '', prefix: 'นาย', firstName: '', lastName: '',
    school: '', category: CATEGORIES[0], major: '', region: 'กลาง', province: 'กรุงเทพมหานคร'
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.email || !form.firstName || !form.lastName || !form.school || !form.major) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setIsSubmitting(true);
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxjQPVEx1FGPOvkCZ43V4STKKhY6VCgodo-A25ykPGiCWaIJGxDe8IvWBvNXcP7GLz/exec';
      await fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(form)
      }).catch(() => {});
    } catch {} finally {
      setIsSubmitting(false);
      handleRegistrationComplete(form);
    }
  };

  if (!isRegModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-glass-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in relative">
        <button onClick={() => setIsRegModalOpen(false)} className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition z-10">
          <X size={22} />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="bg-brand-100 p-4 rounded-full inline-flex mb-3">
              <Download className="w-7 h-7 text-brand-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-800">กรุณากรอกข้อมูลก่อนดาวน์โหลด</h2>
            <p className="text-sm text-surface-500 mt-1">ขอข้อมูลเพียงครั้งเดียว เพื่อเป็นสถิติอ้างอิงการใช้งาน</p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-200 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
              <label className="block text-sm font-semibold text-brand-900 mb-1 flex items-center gap-1"><Mail size={14} /> อีเมล</label>
              <input type="email" placeholder="example@email.com" value={form.email} onChange={e => update('email', e.target.value)} required className="input-field" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">คำนำหน้า</label>
                <select value={form.prefix} onChange={e => update('prefix', e.target.value)} className="input-field bg-surface-50">
                  {PREFIXES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-surface-700 mb-1">ชื่อ</label>
                <input type="text" placeholder="ชื่อจริง" value={form.firstName} onChange={e => update('firstName', e.target.value)} required className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">นามสกุล</label>
                <input type="text" placeholder="นามสกุล" value={form.lastName} onChange={e => update('lastName', e.target.value)} required className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1 flex items-center gap-1"><Building size={14} /> สถานศึกษา</label>
              <input type="text" placeholder="เช่น วิทยาลัยเทคนิค..." value={form.school} onChange={e => update('school', e.target.value)} required className="input-field" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">หมวดวิชา</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field bg-surface-50">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1 flex items-center gap-1"><GraduationCap size={14} /> สาขาวิชา</label>
                <input type="text" placeholder="เช่น ช่างยนต์, บัญชี" value={form.major} onChange={e => update('major', e.target.value)} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1 flex items-center gap-1"><MapPin size={14} /> ภาค</label>
                <select value={form.region} onChange={e => update('region', e.target.value)} className="input-field bg-surface-50">
                  {REGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1 flex items-center gap-1"><MapPin size={14} /> จังหวัด</label>
                <select value={form.province} onChange={e => update('province', e.target.value)} className="input-field bg-surface-50">
                  {PROVINCES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold mt-2 hover:bg-emerald-700 transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Download className="w-5 h-5" />}
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกและดาวน์โหลด'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
