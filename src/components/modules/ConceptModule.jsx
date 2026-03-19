import React from 'react';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, CheckCircle, FileStack, FileDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { extractFileData, prepareFileForAI } from '../../utils/fileHelpers';
import { cleanAndParseJSON } from '../../utils/tableUtils';
import { printToPdf, createWordDoc } from '../../utils/exportUtils';
import { PROMPT_CONCEPT } from '../../prompts/systemPrompts';
import { ModuleHeader, SectionCard, UploadZone, LoadingOverlay, ResultHeader } from '../common';

const STEP_LABELS = ['หลักสูตรรายวิชา','ผลวิเคราะห์งาน','หน่วยการเรียนรู้','ผลลัพธ์การเรียนรู้','สมรรถนะประจำหน่วย','จุดประสงค์เชิงพฤติกรรม'];
const STEP_KEYS = ['syllabus','analysis','units','outcomes','competencies','objectives'];

export default function ConceptModule() {
  const app = useApp();
  const { callAI } = useAI();
  const { formData, generatedPlan, unitDivisionPlan, loResults, compResults, objResults,
    conceptStep, setConceptStep, conceptFiles, setConceptFiles,
    conceptLoading, setConceptLoading, conceptResults, setConceptResults,
    loadingText, setLoadingText, setError, handleError, requireRegistration } = app;

  const handleFileUpload = async (e, key) => {
    try { setConceptFiles(prev => ({ ...prev, [key]: await extractFileData(e.target.files[0]) })); }
    catch (err) { setError(err.message); }
  };

  const getExistingData = (step) => {
    const checks = [formData.courseCode, generatedPlan, unitDivisionPlan, loResults, compResults, objResults];
    return checks[step - 1] ? 'มีข้อมูลในระบบแล้ว' : null;
  };

  const generate = async () => {
    setConceptLoading(true); setLoadingText('กำลังสังเคราะห์สาระสำคัญ...');
    try {
      const contents = [];
      const hasInternal = formData.courseCode && generatedPlan && unitDivisionPlan && loResults && compResults && objResults;
      if (hasInternal && !conceptFiles.syllabus) {
        contents.push({ type: 'text', data: `\n--- 1. Syllabus ---\n${JSON.stringify(formData)}` });
        contents.push({ type: 'text', data: `\n--- 2. Analysis ---\n${generatedPlan}` });
        contents.push({ type: 'text', data: `\n--- 3. Units ---\n${unitDivisionPlan}` });
        contents.push({ type: 'text', data: `\n--- 4. Outcomes ---\n${JSON.stringify(loResults)}` });
        contents.push({ type: 'text', data: `\n--- 5. Competencies ---\n${JSON.stringify(compResults)}` });
        contents.push({ type: 'text', data: `\n--- 6. Objectives ---\n${JSON.stringify(objResults)}` });
      } else {
        STEP_KEYS.forEach((key, i) => {
          if (conceptFiles[key]) contents.push(prepareFileForAI(conceptFiles[key], `${i+1}. ${STEP_LABELS[i]}`));
        });
      }
      const text = await callAI(PROMPT_CONCEPT, contents.filter(Boolean), { requireJson: true });
      const data = cleanAndParseJSON(text);
      if (data?.units) setConceptResults(data.units);
      else throw new Error('Invalid format');
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาด'); }
    finally { setConceptLoading(false); }
  };

  const exportWord = () => {
    if (!conceptResults) return;
    const rows = conceptResults.map((item, idx) => `<tr><td style="text-align:center;vertical-align:top;">${idx+1}</td><td style="vertical-align:top;">${item.unitName}</td><td style="vertical-align:top;">${item.concept}</td></tr>`).join('');
    createWordDoc(`สาระสำคัญ_${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วย</th><th>สาระสำคัญ</th></tr></thead><tbody>${rows}</tbody></table>`);
  };
  const exportPdf = () => {
    if (!conceptResults) return;
    const rows = conceptResults.map((item, idx) => `<tr><td style="text-align:center;">${idx+1}</td><td>${item.unitName}</td><td>${item.concept}</td></tr>`).join('');
    printToPdf(`สาระสำคัญ ${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วย</th><th>สาระสำคัญ</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  // Full Syllabus Export
  const mergeData = () => {
    if (!loResults) return [];
    return loResults.map((lo, i) => ({
      unitName: lo.unitName, outcome: lo.outcome,
      competencies: compResults?.[i]?.competencies || [],
      objectives: objResults?.[i] || { cognitive: [], psychomotor: [], affective: [], application: [] },
      concept: conceptResults?.[i]?.concept || '-',
    }));
  };

  const exportFullWord = () => {
    const data = mergeData();
    if (!data.length) return;
    const renderList = (list) => !list?.length ? '<li>-</li>' : list.map(i => `<li>${i}</li>`).join('');
    const html = data.map((u, idx) => `
      <div style="margin-bottom:30px;page-break-inside:avoid;">
        <h3>หน่วยที่ ${idx+1} ${u.unitName}</h3>
        <h4>1. ผลลัพธ์การเรียนรู้</h4><p style="margin-left:20px;">${u.outcome||'-'}</p>
        <h4>2. สมรรถนะประจำหน่วย</h4><ul style="margin-left:20px;">${renderList(u.competencies)}</ul>
        <h4>3. จุดประสงค์เชิงพฤติกรรม</h4>
        <div style="margin-left:20px;">
          <b>3.1 พุทธิพิสัย</b><ul>${renderList(u.objectives.cognitive)}</ul>
          <b>3.2 ทักษะพิสัย</b><ul>${renderList(u.objectives.psychomotor)}</ul>
          <b>3.3 จิตพิสัย</b><ul>${renderList(u.objectives.affective)}</ul>
          <b>3.4 การประยุกต์ใช้ฯ</b><ul>${renderList(u.objectives.application)}</ul>
        </div>
        <h4>4. สาระการเรียนรู้</h4><p style="margin-left:20px;">${u.concept||'-'}</p>
        <hr/>
      </div>
    `).join('');
    createWordDoc(`Full_Syllabus_${formData.courseCode}`, `<h2 style="text-align:center;">เอกสารสรุปรายวิชา ${formData.courseCode} ${formData.courseName}</h2><hr/>${html}`);
  };

  const exportFullPdf = () => {
    const data = mergeData();
    if (!data.length) return;
    const renderList = (list) => !list?.length ? '<li>-</li>' : list.map(i => `<li>${i}</li>`).join('');
    const html = data.map((u, idx) => `
      <div style="margin-bottom:30px;border-bottom:1px solid #ccc;padding-bottom:20px;">
        <h3>หน่วยที่ ${idx+1} ${u.unitName}</h3>
        <p><b>1. ผลลัพธ์การเรียนรู้</b><br/>${u.outcome||'-'}</p>
        <p><b>2. สมรรถนะประจำหน่วย</b></p><ul>${renderList(u.competencies)}</ul>
        <p><b>3. จุดประสงค์เชิงพฤติกรรม</b></p>
        <div style="padding-left:20px;">
          <p><b>3.1 พุทธิพิสัย:</b></p><ul>${renderList(u.objectives.cognitive)}</ul>
          <p><b>3.2 ทักษะพิสัย:</b></p><ul>${renderList(u.objectives.psychomotor)}</ul>
          <p><b>3.3 จิตพิสัย:</b></p><ul>${renderList(u.objectives.affective)}</ul>
          <p><b>3.4 การประยุกต์ใช้ฯ:</b></p><ul>${renderList(u.objectives.application)}</ul>
        </div>
        <p><b>4. สาระการเรียนรู้</b><br/>${u.concept||'-'}</p>
      </div>
    `).join('');
    printToPdf(`เอกสารสรุปรายวิชา: ${formData.courseName}`, html);
  };

  const currentKey = STEP_KEYS[conceptStep - 1];
  const existing = getExistingData(conceptStep);

  return (
    <SectionCard className="min-h-[80vh]">
      <ModuleHeader emoji="💡" title="สาระสำคัญ" subtitle="สรุปสาระสำคัญของแต่ละหน่วยจากข้อมูลทั้งหมด" />

      {!conceptResults ? (
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-[10px] font-bold text-surface-400 mb-2 uppercase tracking-wider"><span>Start</span><span>Step {conceptStep}/6</span><span>Finish</span></div>
            <div className="w-full bg-surface-200 rounded-full h-2"><div className="bg-brand-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(conceptStep/6)*100}%` }} /></div>
          </div>

          <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm mb-6 animate-slide-right">
            <h3 className="font-display text-lg font-bold text-surface-800 mb-4 flex items-center gap-2">
              <span className="bg-brand-100 text-brand-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{conceptStep}</span>
              {STEP_LABELS[conceptStep-1]}
            </h3>
            {existing && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl flex items-center gap-2 mb-4 text-sm">
                <CheckCircle size={16} /> {existing} (กดถัดไปได้เลย)
              </div>
            )}
            <UploadZone file={conceptFiles[currentKey]} onFileChange={e => handleFileUpload(e, currentKey)} label={`แนบ${STEP_LABELS[conceptStep-1]}`} className="min-h-[180px]" />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setConceptStep(Math.max(1, conceptStep-1))} disabled={conceptStep === 1} className="btn-ghost disabled:opacity-50">
              <ChevronLeft size={16} /> ย้อนกลับ
            </button>
            {conceptStep < 6 ? (
              <button onClick={() => setConceptStep(conceptStep+1)} className="btn-primary">ถัดไป <ChevronRight size={16} /></button>
            ) : (
              <button onClick={generate} disabled={conceptLoading} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700">
                {conceptLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างสาระสำคัญ
              </button>
            )}
          </div>
          {conceptLoading && <div className="mt-6"><LoadingOverlay text={loadingText} /></div>}
        </div>
      ) : (
        <div className="animate-slide-up">
          <ResultHeader title="สร้างสาระสำคัญสำเร็จ!" count={conceptResults.length}
            onRegenerate={generate} onExportWord={exportWord} onExportPdf={exportPdf} requireRegistration={requireRegistration} />

          <div className="mt-4 overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-surface-50"><tr><th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-1/4">หน่วย</th><th className="px-4 py-3 text-left text-xs font-bold text-surface-700">สาระสำคัญ</th></tr></thead>
              <tbody className="bg-white divide-y divide-surface-100">
                {conceptResults.map((item, idx) => (
                  <tr key={idx}><td className="px-4 py-4 text-sm font-medium text-surface-900 align-top">{item.unitName}</td><td className="px-4 py-4 text-sm text-surface-600 align-top leading-relaxed">{item.concept}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final Summary Section */}
          <div className="mt-8 text-center bg-gradient-to-br from-emerald-50 to-brand-50 p-8 rounded-2xl border border-emerald-200 animate-scale-in">
            <div className="bg-emerald-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-600 w-8 h-8" />
            </div>
            <h4 className="font-display text-emerald-800 font-bold text-xl mb-2">🎉 ดำเนินการครบทุกขั้นตอนแล้ว!</h4>
            <p className="text-surface-600 mb-6">วิเคราะห์และจัดทำข้อมูลหลักสูตรครบถ้วนสมบูรณ์</p>

            <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
              <button onClick={() => requireRegistration(exportFullWord)} className="btn-primary !px-6 !py-3 !text-base shadow-brand">
                <FileStack size={18} /> ดาวน์โหลด Full Syllabus (Word)
              </button>
              <button onClick={() => requireRegistration(exportFullPdf)} className="btn-danger !px-6 !py-3 !text-base">
                <FileDown size={18} /> ดาวน์โหลด Full Syllabus (PDF)
              </button>
            </div>

            <div className="p-4 bg-white border border-surface-200 rounded-xl max-w-md mx-auto text-left">
              <p className="text-sm text-surface-500 font-bold mb-2">สรุปสิ่งที่ได้รับ:</p>
              <ul className="text-sm text-surface-700 space-y-1 list-none">
                {['📊 วิเคราะห์งาน (Job Analysis)','📋 แบ่งหน่วยการเรียนรู้','🎯 ผลลัพธ์การเรียนรู้','⚡ สมรรถนะประจำหน่วย','✅ จุดประสงค์เชิงพฤติกรรม','💡 สาระสำคัญ'].map((t,i) => (
                  <li key={i} className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
