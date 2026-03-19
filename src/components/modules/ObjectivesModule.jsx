import React from 'react';
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { extractFileData, prepareFileForAI } from '../../utils/fileHelpers';
import { cleanAndParseJSON } from '../../utils/tableUtils';
import { printToPdf, createWordDoc } from '../../utils/exportUtils';
import { PROMPT_OBJECTIVES } from '../../prompts/systemPrompts';
import { ModuleHeader, SectionCard, UploadZone, AutoModeBadge, LoadingOverlay, ResultHeader, NextStepBanner } from '../common';

const DOMAINS = [
  { key: 'cognitive', label: 'พุทธิพิสัย', sublabel: 'Cognitive', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'psychomotor', label: 'ทักษะพิสัย', sublabel: 'Psychomotor', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { key: 'affective', label: 'จิตพิสัย', sublabel: 'Affective', color: 'bg-pink-50 text-pink-800 border-pink-200' },
  { key: 'application', label: 'การประยุกต์ใช้', sublabel: 'Application', color: 'bg-purple-50 text-purple-800 border-purple-200' },
];

export default function ObjectivesModule() {
  const app = useApp();
  const { callAI } = useAI();
  const { formData, compResults, loResults, objStep, setObjStep, objFiles, setObjFiles,
    objLoading, setObjLoading, objResults, setObjResults, loadingText, setLoadingText,
    setError, handleError, setActiveMenu, requireRegistration } = app;

  const hasInternal = formData.courseCode && compResults && loResults;

  const handleFileUpload = async (e, type) => {
    try { setObjFiles(prev => ({ ...prev, [type]: await extractFileData(e.target.files[0]) })); }
    catch (err) { setError(err.message); }
  };

  const generate = async () => {
    if (!hasInternal && !(objFiles.syllabus && objFiles.competencies && objFiles.outcomes)) {
      setError('ข้อมูลไม่เพียงพอ กรุณาอัปโหลดไฟล์ให้ครบ'); return;
    }
    setObjLoading(true); setLoadingText('กำลังวิเคราะห์จุดประสงค์เชิงพฤติกรรม...');
    try {
      const contents = [];
      if (hasInternal && !objFiles.syllabus) {
        contents.push({ type: 'text', data: `\n--- Course ---\n${JSON.stringify(formData)}` });
        contents.push({ type: 'text', data: `\n--- Competencies ---\n${JSON.stringify(compResults)}` });
        contents.push({ type: 'text', data: `\n--- Outcomes ---\n${JSON.stringify(loResults)}` });
      } else {
        if (objFiles.syllabus) contents.push(prepareFileForAI(objFiles.syllabus, 'Syllabus'));
        if (objFiles.competencies) contents.push(prepareFileForAI(objFiles.competencies, 'Competencies'));
        if (objFiles.outcomes) contents.push(prepareFileForAI(objFiles.outcomes, 'Outcomes'));
      }
      const text = await callAI(PROMPT_OBJECTIVES, contents.filter(Boolean), { requireJson: true });
      const data = cleanAndParseJSON(text);
      if (data?.units) setObjResults(data.units);
      else throw new Error('Invalid format');
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาด'); }
    finally { setObjLoading(false); }
  };

  const exportWord = () => {
    if (!objResults) return;
    const renderList = (list) => !list?.length ? '-' : `<ul style="margin:0;padding-left:15px;">${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
    const rows = objResults.map((item, idx) => `<tr>
      <td style="text-align:center;vertical-align:top;">${idx+1}</td>
      <td style="vertical-align:top;">${item.unitName}</td>
      <td style="vertical-align:top;">${renderList(item.cognitive)}</td>
      <td style="vertical-align:top;">${renderList(item.psychomotor)}</td>
      <td style="vertical-align:top;">${renderList(item.affective)}</td>
      <td style="vertical-align:top;">${renderList(item.application)}</td>
    </tr>`).join('');
    createWordDoc(`จุดประสงค์_${formData.courseCode}`, `<table><thead><tr><th rowspan="2">ที่</th><th rowspan="2">หน่วย</th><th colspan="4">จุดประสงค์เชิงพฤติกรรม</th></tr><tr><th>พุทธิพิสัย</th><th>ทักษะพิสัย</th><th>จิตพิสัย</th><th>การประยุกต์ใช้</th></tr></thead><tbody>${rows}</tbody></table>`);
  };
  const exportPdf = () => {
    if (!objResults) return;
    const renderList = (list) => !list?.length ? '-' : `<ul>${list.map(i => `<li>${i}</li>`).join('')}</ul>`;
    const rows = objResults.map((item, idx) => `<tr><td style="text-align:center;">${idx+1}</td><td>${item.unitName}</td><td>
      <b>1. พุทธิพิสัย:</b>${renderList(item.cognitive)}<b>2. ทักษะพิสัย:</b>${renderList(item.psychomotor)}<b>3. จิตพิสัย:</b>${renderList(item.affective)}<b>4. การประยุกต์ใช้:</b>${renderList(item.application)}
    </td></tr>`).join('');
    printToPdf(`จุดประสงค์ ${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วย</th><th>จุดประสงค์ (4 ด้าน)</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  const STEP_CONFIGS = [
    { key: 'syllabus', label: 'หลักสูตรรายวิชา', color: 'brand' },
    { key: 'competencies', label: 'สมรรถนะประจำหน่วย', color: 'purple' },
    { key: 'outcomes', label: 'ผลลัพธ์การเรียนรู้', color: 'green' },
  ];

  return (
    <SectionCard className="min-h-[80vh]">
      <ModuleHeader emoji="✅" title="จุดประสงค์เชิงพฤติกรรม" subtitle="วิเคราะห์จุดประสงค์ 4 ด้าน ตามทฤษฎี Bloom" />

      {!objResults && (
        <div className="max-w-xl mx-auto">
          {hasInternal ? (
            <div className="space-y-4">
              <AutoModeBadge moduleName="Module 1-3" />
              <button onClick={generate} disabled={objLoading} className="btn-primary w-full !py-3">
                {objLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างจุดประสงค์ทันที
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6 gap-2">
                {STEP_CONFIGS.map((sc, i) => (
                  <React.Fragment key={sc.key}>
                    {i > 0 && <div className={`w-12 h-0.5 ${objStep > i ? 'bg-brand-500' : 'bg-surface-200'}`} />}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold transition ${objStep > i ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-surface-300 text-surface-400'}`}>{i+1}</div>
                  </React.Fragment>
                ))}
              </div>

              {STEP_CONFIGS.map((sc, i) => objStep === i + 1 && (
                <div key={sc.key} className="animate-slide-right">
                  {i > 0 && <button onClick={() => setObjStep(i)} className="btn-ghost text-xs mb-2"><ChevronLeft size={14} /> ย้อนกลับ</button>}
                  <h3 className="font-display text-lg font-bold text-surface-800 text-center mb-4">ขั้นตอนที่ {i+1}: {sc.label}</h3>
                  <UploadZone file={objFiles[sc.key]} onFileChange={e => handleFileUpload(e, sc.key)} label={`แนบไฟล์${sc.label}`} color={sc.color} className="min-h-[220px]" />
                  {objFiles[sc.key] && (
                    i < STEP_CONFIGS.length - 1 ? (
                      <button onClick={() => setObjStep(i + 2)} className="btn-primary w-full mt-4">ถัดไป <ChevronRight size={16} /></button>
                    ) : (
                      <button onClick={generate} disabled={objLoading} className="btn-primary w-full mt-4 !bg-emerald-600 hover:!bg-emerald-700">
                        {objLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างจุดประสงค์
                      </button>
                    )
                  )}
                </div>
              ))}
            </>
          )}
          {objLoading && <LoadingOverlay text={loadingText} />}
        </div>
      )}

      {objResults && (
        <div className="animate-slide-up">
          <ResultHeader title="วิเคราะห์เสร็จสิ้น!" count={objResults.length}
            onRegenerate={generate} onExportWord={exportWord} onExportPdf={exportPdf} requireRegistration={requireRegistration} />

          <div className="mt-4 overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-surface-200">
              <thead className="bg-surface-50">
                <tr><th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-20">ที่</th><th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-1/4">หน่วย</th><th className="px-4 py-3 text-left text-xs font-bold text-surface-700">จุดประสงค์ 4 ด้าน</th></tr>
              </thead>
              <tbody className="bg-white divide-y divide-surface-100">
                {objResults.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-center text-surface-500 align-top">{idx+1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-surface-900 align-top">{item.unitName}</td>
                    <td className="px-4 py-3 text-sm text-surface-600 align-top">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {DOMAINS.map(d => (
                          <div key={d.key} className={`p-3 rounded-xl border ${d.color}`}>
                            <span className="font-bold text-xs uppercase tracking-wider block mb-2 border-b pb-1 border-inherit">{d.label}</span>
                            <ul className="list-disc pl-4 space-y-1 text-xs">{item[d.key]?.map((i, k) => <li key={k}>{i}</li>)}</ul>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NextStepBanner label="ไปสร้างสาระสำคัญ (Module 5)" onClick={() => setActiveMenu('concept')} description="ระบบจะส่งจุดประสงค์ไปดำเนินการต่อ" />
        </div>
      )}
    </SectionCard>
  );
}
