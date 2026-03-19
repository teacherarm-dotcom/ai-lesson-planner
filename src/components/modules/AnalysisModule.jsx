import React from 'react';
import { Upload, FileText, FileType, Loader2, Check, PenTool, BookOpen, RefreshCw, Search, Sparkles, ArrowRight, Paperclip, AlertTriangle, FileDown, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { extractFileData, prepareFileForAI } from '../../utils/fileHelpers';
import { parseUnitTable, convertUnitTableToHTML, convertMarkdownTableToHTML, cleanAndParseJSON } from '../../utils/tableUtils';
import { printToPdf, createWordDoc } from '../../utils/exportUtils';
import { PROMPT_EXTRACTION, PROMPT_STANDARD_OCR, generateAnalysisPrompt, generateUnitDivisionPrompt } from '../../prompts/systemPrompts';
import { MarkdownTableRenderer, LoadingOverlay, UploadZone, ModuleHeader, SectionCard, ResultHeader, NextStepBanner } from '../common';

function UnitTableWithTooltip({ markdown }) {
  const [hovered, setHovered] = React.useState(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const units = parseUnitTable(markdown);
  if (units.length === 0) return <MarkdownTableRenderer content={markdown} />;

  return (
    <div className="relative overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-16">หน่วยที่</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-surface-700">ชื่อหน่วยการเรียนรู้</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-surface-700 w-20">ทฤษฎี</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-surface-700 w-20">ปฏิบัติ</th>
            <th className="px-4 py-3 text-center text-xs font-bold text-surface-700 w-20">รวม</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-surface-100">
          {units.map((unit, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-surface-50/50'}>
              <td className="px-4 py-3 text-sm text-surface-600 align-top">{unit.no}</td>
              <td className="px-4 py-3 text-sm text-brand-700 font-medium align-top cursor-help hover:underline decoration-dashed decoration-brand-300 underline-offset-4"
                onMouseEnter={(e) => { setHovered(unit); setPos({ x: e.clientX, y: e.clientY }); }}
                onMouseMove={(e) => hovered && setPos({ x: e.clientX, y: e.clientY })}
                onMouseLeave={() => setHovered(null)}
              >{unit.name}</td>
              <td className="px-4 py-3 text-sm text-surface-600 text-center align-top">{unit.theory}</td>
              <td className="px-4 py-3 text-sm text-surface-600 text-center align-top">{unit.practice}</td>
              <td className="px-4 py-3 text-sm text-surface-800 text-center align-top font-bold">{unit.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hovered && (
        <div className="fixed z-50 bg-surface-800 text-white p-4 rounded-xl shadow-xl max-w-sm pointer-events-none animate-fade-in"
          style={{ left: `${pos.x + 20}px`, top: `${pos.y + 20}px` }}>
          <div className="font-bold mb-2 text-amber-400 border-b border-surface-600 pb-1 text-xs">หัวข้อเรื่อง</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap"><ReactMarkdown>{hovered.topics}</ReactMarkdown></div>
        </div>
      )}
    </div>
  );
}

export default function AnalysisModule() {
  const app = useApp();
  const { callAI } = useAI();
  const { analysisStep: step, setAnalysisStep: setStep, courseFile, setCourseFile,
    hasStandard, setHasStandard, standardContent, setStandardContent, standardFileName, setStandardFileName,
    formData, setFormData, generatedPlan, setGeneratedPlan, unitDivisionPlan, setUnitDivisionPlan,
    dividingUnits, setDividingUnits, loading, setLoading, loadingText, setLoadingText,
    setError, handleError, setActiveMenu, requireRegistration, setIsStandardPopupOpen } = app;

  const getCourseLevel = (code) => {
    const c = code?.trim() || '';
    if (c.startsWith('2')) return { text: 'ปวช.', color: 'bg-brand-100 text-brand-700' };
    if (c.startsWith('3')) return { text: 'ปวส.', color: 'bg-purple-100 text-purple-700' };
    return { text: 'ไม่ระบุ', color: 'bg-surface-100 text-surface-600' };
  };

  const getTheoryPractice = (ratio) => {
    let theory = 0, practice = 0;
    const match = ratio ? ratio.match(/(\d+)\s*[-–]\s*(\d+)/) : null;
    if (match) { theory = parseInt(match[1]); practice = parseInt(match[2]); }
    return { theory, practice };
  };

  const handleCourseUpload = async (e) => {
    try {
      const data = await extractFileData(e.target.files[0]);
      setCourseFile(data);
    } catch (err) { setError(err.message); }
  };

  const handleStandardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStandardFileName(file.name);
    if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      setStandardContent(`(ไฟล์ Word แนบ: ${file.name})`);
      return;
    }
    setLoading(true); setLoadingText('กำลังอ่านไฟล์มาตรฐานอาชีพ...');
    try {
      const fileData = await extractFileData(file);
      const content = prepareFileForAI(fileData);
      const text = await callAI(PROMPT_STANDARD_OCR, [content]);
      setStandardContent(text);
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาดในการอ่านไฟล์มาตรฐาน'); }
    finally { setLoading(false); }
  };

  const callExtraction = async () => {
    if (!courseFile) { setError('กรุณาแนบไฟล์หลักสูตรรายวิชา'); return; }
    if (courseFile.type === 'word') { setStep(2); return; }
    setLoading(true); setLoadingText('กำลังอ่านข้อมูลจากหลักสูตร (OCR)...');
    try {
      const content = prepareFileForAI(courseFile);
      const text = await callAI(PROMPT_EXTRACTION, [content], { requireJson: true });
      const data = cleanAndParseJSON(text);
      if (data && data.isValidCurriculum === false) { setError('เอกสารไม่ใช่หลักสูตรรายวิชา กรุณาตรวจสอบไฟล์'); return; }
      if (data) {
        const fmt = (s) => s ? s.replace(/(\d+\.)/g, '\n$1').trim() : '';
        data.objectives = fmt(data.objectives);
        data.competencies = fmt(data.competencies);
        setFormData(prev => ({ ...prev, ...data }));
        setStep(2);
      } else { throw new Error('Failed to parse JSON'); }
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาดในการดึงข้อมูล'); }
    finally { setLoading(false); }
  };

  const generateUnitDivision = async (planText, fd) => {
    setDividingUnits(true);
    let weeks = fd.courseCode?.trim().startsWith('3') ? 15 : 18;
    const { theory, practice } = getTheoryPractice(fd.ratio);
    try {
      const prompt = generateUnitDivisionPrompt(planText, weeks, theory, practice, fd.description);
      const text = await callAI(prompt, []);
      if (text) setUnitDivisionPlan(text);
    } catch (err) { console.error(err); }
    finally { setDividingUnits(false); }
  };

  const callGeneration = async () => {
    if (hasStandard && !standardContent) { setError('กรุณาแนบไฟล์มาตรฐานก่อนสร้างโครงการสอน'); return; }
    setLoading(true); setLoadingText('กำลังวิเคราะห์ Job-Duty-Task...');
    setGeneratedPlan(null); setUnitDivisionPlan(null);
    try {
      const prompt = generateAnalysisPrompt(formData, hasStandard ? standardContent : '');
      const text = await callAI(prompt, []);
      if (text) {
        setGeneratedPlan(text); setStep(3);
        generateUnitDivision(text, formData);
      } else { throw new Error('No plan generated'); }
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาดในการสร้างแผน'); }
    finally { setLoading(false); }
  };

  // Export handlers
  const exportAnalysisWord = () => { if (!generatedPlan) return; createWordDoc(`Job_Analysis_${formData.courseCode}`, convertMarkdownTableToHTML(generatedPlan)); };
  const exportAnalysisPdf = () => { if (!generatedPlan) return; printToPdf(`ตารางวิเคราะห์: ${formData.courseName}`, convertMarkdownTableToHTML(generatedPlan)); };
  const exportUnitsWord = () => {
    if (!unitDivisionPlan) return;
    const units = parseUnitTable(unitDivisionPlan);
    const { rowsHtml, totalTheory, totalPractice, totalAll } = convertUnitTableToHTML(units);
    const html = `<table><thead><tr><th>หน่วยที่</th><th>ชื่อหน่วยการเรียนรู้</th><th>ทฤษฎี</th><th>ปฏิบัติ</th><th>รวม</th></tr></thead><tbody>${rowsHtml}<tr style="font-weight:bold;"><td colspan="2" style="text-align:right;">รวม</td><td style="text-align:center;">${totalTheory}</td><td style="text-align:center;">${totalPractice}</td><td style="text-align:center;">${totalAll}</td></tr></tbody></table>`;
    createWordDoc(`หน่วยการเรียนรู้_${formData.courseCode}`, html);
  };
  const exportUnitsPdf = () => {
    if (!unitDivisionPlan) return;
    const units = parseUnitTable(unitDivisionPlan);
    const { rowsHtml, totalTheory, totalPractice, totalAll } = convertUnitTableToHTML(units);
    const html = `<table><thead><tr><th>หน่วยที่</th><th>ชื่อหน่วยการเรียนรู้</th><th>ทฤษฎี</th><th>ปฏิบัติ</th><th>รวม</th></tr></thead><tbody>${rowsHtml}<tr style="font-weight:bold;"><td colspan="2" style="text-align:right;">รวม</td><td style="text-align:center;">${totalTheory}</td><td style="text-align:center;">${totalPractice}</td><td style="text-align:center;">${totalAll}</td></tr></tbody></table>`;
    printToPdf(`หน่วยการเรียนรู้ ${formData.courseCode}`, html);
  };

  const levelInfo = getCourseLevel(formData.courseCode);
  const { theory, practice } = getTheoryPractice(formData.ratio);
  const weeklyHours = theory + practice;

  return (
    <SectionCard className="min-h-[80vh]">
      <ModuleHeader emoji="📊" title="วิเคราะห์งาน/หน่วยการเรียนรู้" subtitle="วิเคราะห์หลักสูตรเพื่อกำหนด Job — Duty — Task" />

      {loading && <LoadingOverlay text={loadingText} />}

      {/* Step 1: Upload */}
      {!loading && step === 1 && (
        <div className="space-y-4">
          <div className="upload-zone min-h-[280px]">
            <input type="file" accept="image/*,application/pdf,.doc,.docx" onChange={handleCourseUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            {courseFile ? (
              <div className="text-center">
                {courseFile.type === 'image' ? (
                  <img src={courseFile.data} alt="Preview" className="max-h-48 rounded-xl shadow-md mb-3 mx-auto" />
                ) : (
                  <div className={`p-4 rounded-full mb-3 mx-auto w-fit ${courseFile.type === 'pdf' ? 'bg-red-100' : 'bg-brand-100'}`}>
                    {courseFile.type === 'pdf' ? <FileText className="w-12 h-12 text-red-600" /> : <FileType className="w-12 h-12 text-brand-600" />}
                  </div>
                )}
                <p className="text-brand-700 font-bold">{courseFile.name}</p>
                <p className="text-xs text-surface-400 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-14 h-14 text-brand-400 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-brand-800">อัปโหลดหลักสูตรรายวิชา</h3>
                <p className="text-sm text-brand-500 mt-1">รองรับ Word, PDF, รูปภาพ</p>
              </div>
            )}
          </div>
          <div className="text-center">
            <button onClick={(e) => { e.stopPropagation(); callExtraction(); }} disabled={loading} className="btn-primary !px-8 !py-3">
              {loading ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
              {courseFile?.type === 'word' ? 'ไปหน้ากรอกข้อมูล' : 'ดึงข้อมูลรายวิชาอัตโนมัติ'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Edit */}
      {!loading && step === 2 && (
        <div className="space-y-5 animate-slide-up">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-800 flex items-start gap-3">
            <PenTool className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div><p className="font-bold">ตรวจสอบความถูกต้อง & เพิ่มเติมข้อมูล</p><p>สามารถแก้ไข และแนบมาตรฐานอาชีพเพิ่มเติมได้</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-surface-700 mb-1">รหัสวิชา</label><input className="input-field font-mono" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold text-surface-700 mb-1">ชื่อวิชา</label><input className="input-field" value={formData.courseName} onChange={e => setFormData({...formData, courseName: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold text-surface-700 mb-1">หน่วยกิต</label><input className="input-field" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} /></div>
            <div><label className="block text-sm font-semibold text-surface-700 mb-1">ท-ป-น</label><input className="input-field" value={formData.ratio} onChange={e => setFormData({...formData, ratio: e.target.value})} /></div>
          </div>

          <div className="flex flex-wrap gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200 text-xs text-surface-500">
            <span className={`badge ${levelInfo.color}`}>{levelInfo.text}</span>
            <span className="badge bg-surface-100 text-surface-600">{weeklyHours > 0 ? `${weeklyHours} ชม./สัปดาห์` : 'ไม่ระบุ'}</span>
          </div>

          <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
            <label className="block text-sm font-semibold text-surface-700 mb-2">อ้างอิงมาตรฐาน</label>
            <div className="flex gap-2">
              <input className="input-field flex-1" value={formData.standardRef} onChange={e => setFormData({...formData, standardRef: e.target.value})} placeholder="ไม่มี (ระบุถ้ามี)" />
              <button onClick={() => setIsStandardPopupOpen(true)} className="btn-primary !whitespace-nowrap !text-sm"><Search size={14} /> ค้นหา</button>
            </div>
          </div>

          {/* Standard Toggle */}
          <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200">
            <h3 className="font-display font-bold text-brand-900 mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-600" /> มีมาตรฐานอาชีพอ้างอิงไหม?</h3>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!hasStandard} onChange={() => setHasStandard(false)} className="w-4 h-4 text-brand-600" /><span>ไม่มี</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={hasStandard} onChange={() => setHasStandard(true)} className="w-4 h-4 text-brand-600" /><span className="font-medium">มี (แนบไฟล์)</span></label>
            </div>
            {hasStandard && (
              <div className="bg-white p-4 rounded-xl border border-brand-200 animate-slide-up">
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-brand-50 hover:bg-brand-100 border border-brand-300 text-brand-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition">
                    <Paperclip size={16} /> {standardFileName || 'คลิกเพื่อเลือกไฟล์...'}
                    <input type="file" accept="image/*,application/pdf,.doc,.docx" onChange={handleStandardUpload} className="hidden" />
                  </label>
                  {standardContent && <Check className="text-emerald-500 w-6 h-6" />}
                </div>
              </div>
            )}
          </div>

          <div><label className="block text-sm font-semibold text-surface-700 mb-1">ผลลัพธ์การเรียนรู้</label><textarea rows={3} className="textarea-field" value={formData.learningOutcomes} onChange={e => setFormData({...formData, learningOutcomes: e.target.value})} /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-1">จุดประสงค์รายวิชา</label><textarea rows={3} className="textarea-field" value={formData.objectives} onChange={e => setFormData({...formData, objectives: e.target.value})} /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-1">สมรรถนะรายวิชา</label><textarea rows={3} className="textarea-field" value={formData.competencies} onChange={e => setFormData({...formData, competencies: e.target.value})} /></div>
          <div><label className="block text-sm font-semibold text-surface-700 mb-1">คำอธิบายรายวิชา</label><textarea rows={3} className="textarea-field bg-surface-50" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>

          <div className="flex justify-between pt-4 border-t border-surface-100">
            <button onClick={() => setStep(1)} className="btn-ghost">← กลับ</button>
            <button onClick={callGeneration} disabled={loading} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg flex items-center gap-2 transition">
              {loading ? <Loader2 className="animate-spin" /> : <BookOpen size={18} />} สร้างโครงการสอน
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {!loading && step === 3 && (
        <div className="space-y-6 animate-slide-up">
          <ResultHeader title="สร้างโครงการสอนสำเร็จ!" onRegenerate={() => setStep(2)}
            onExportWord={exportAnalysisWord} onExportPdf={exportAnalysisPdf} requireRegistration={requireRegistration} />

          <div className="bg-white p-2 md:p-4 rounded-xl border border-surface-200">
            <p className="text-xs text-surface-400 mb-3 flex items-center gap-1">📊 ตารางวิเคราะห์หน่วยการเรียนรู้</p>
            <MarkdownTableRenderer content={generatedPlan} />
          </div>

          {dividingUnits && <LoadingOverlay text="กำลังแบ่งหน่วยการเรียนรู้..." />}

          {unitDivisionPlan && (
            <div className="bg-brand-50 p-2 md:p-6 rounded-2xl border border-brand-200 animate-slide-up">
              <ResultHeader title="ตารางหน่วยการเรียนรู้"
                onRegenerate={() => { setUnitDivisionPlan(null); generateUnitDivision(generatedPlan, formData); }}
                onExportWord={exportUnitsWord} onExportPdf={exportUnitsPdf} requireRegistration={requireRegistration} />
              <div className="mt-4">
                <UnitTableWithTooltip markdown={unitDivisionPlan} />
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <p>นำเมาส์ไปวางที่ชื่อหน่วยเพื่อดูหัวข้อย่อย — ข้อมูลเป็นตัวอย่างจาก AI สามารถปรับเปลี่ยนได้</p>
              </div>
              <NextStepBanner label="ไปสร้างผลลัพธ์การเรียนรู้ (Module 2)" onClick={() => setActiveMenu('learning_outcomes')}
                description="ระบบจะส่งข้อมูลตารางหน่วยฯ ไปให้โดยอัตโนมัติ" />
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
