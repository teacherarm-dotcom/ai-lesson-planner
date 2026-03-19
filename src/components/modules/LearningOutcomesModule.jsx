import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { extractFileData, prepareFileForAI } from '../../utils/fileHelpers';
import { cleanAndParseJSON } from '../../utils/tableUtils';
import { printToPdf, createWordDoc } from '../../utils/exportUtils';
import { PROMPT_LEARNING_OUTCOMES } from '../../prompts/systemPrompts';
import { ModuleHeader, SectionCard, UploadZone, AutoModeBadge, LoadingOverlay, ResultHeader, NextStepBanner } from '../common';

export default function LearningOutcomesModule() {
  const app = useApp();
  const { callAI } = useAI();
  const { unitDivisionPlan, generatedPlan, loFiles, setLoFiles, loLoading, setLoLoading,
    loResults, setLoResults, loadingText, setLoadingText, setError, handleError,
    setActiveMenu, requireRegistration, formData } = app;

  const hasPrevData = unitDivisionPlan && generatedPlan;

  const handleFileUpload = async (e, type) => {
    try {
      const data = await extractFileData(e.target.files[0]);
      setLoFiles(prev => ({ ...prev, [type]: data }));
    } catch (err) { setError(err.message); }
  };

  const generate = async () => {
    if (!hasPrevData && (!loFiles.units || !loFiles.analysis)) {
      setError('กรุณาแนบไฟล์ทั้ง 2 ไฟล์ให้ครบถ้วน'); return;
    }
    setLoLoading(true); setLoadingText('กำลังวิเคราะห์ผลลัพธ์การเรียนรู้...');
    try {
      const contents = [];
      if (hasPrevData && !loFiles.units) {
        contents.push({ type: 'text', data: `\n--- ตารางหน่วย ---\n${unitDivisionPlan}` });
        contents.push({ type: 'text', data: `\n--- ตารางวิเคราะห์งาน ---\n${generatedPlan}` });
      } else {
        if (loFiles.units) contents.push(prepareFileForAI(loFiles.units, 'ตารางหน่วยการเรียนรู้'));
        if (loFiles.analysis) contents.push(prepareFileForAI(loFiles.analysis, 'ตารางวิเคราะห์งาน'));
      }
      const text = await callAI(PROMPT_LEARNING_OUTCOMES, contents.filter(Boolean), { requireJson: true });
      const data = cleanAndParseJSON(text);
      if (data?.units) setLoResults(data.units);
      else throw new Error('Invalid format');
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาดในการวิเคราะห์'); }
    finally { setLoLoading(false); }
  };

  const exportWord = () => {
    if (!loResults) return;
    const rows = loResults.map((item, idx) => `<tr><td style="text-align:center;">${idx+1}</td><td>${item.unitName}</td><td>${item.outcome}</td></tr>`).join('');
    createWordDoc(`ผลลัพธ์การเรียนรู้_${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วยการเรียนรู้</th><th>ผลลัพธ์การเรียนรู้</th></tr></thead><tbody>${rows}</tbody></table>`);
  };
  const exportPdf = () => {
    if (!loResults) return;
    const rows = loResults.map((item, idx) => `<tr><td style="text-align:center;">${idx+1}</td><td>${item.unitName}</td><td>${item.outcome}</td></tr>`).join('');
    printToPdf(`ผลลัพธ์การเรียนรู้ ${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วยการเรียนรู้</th><th>ผลลัพธ์การเรียนรู้</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  return (
    <SectionCard className="min-h-[80vh]">
      <ModuleHeader emoji="🎯" title="ผลลัพธ์การเรียนรู้ประจำหน่วย" subtitle="ผลลัพธ์นอกห้องเรียนที่เกิดจากการนำความรู้ไปประยุกต์ใช้จริง" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          {hasPrevData ? (
            <div className="space-y-4">
              <AutoModeBadge moduleName="Module 1" />
              <button onClick={generate} disabled={loLoading} className="btn-primary w-full !py-3">
                {loLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างผลลัพธ์การเรียนรู้ทันที
              </button>
            </div>
          ) : (
            <>
              <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 text-center"><p className="text-sm text-surface-500 font-medium">Upload ข้อมูลด้วยตนเอง</p></div>
              <UploadZone file={loFiles.units} onFileChange={e => handleFileUpload(e, 'units')} label="1. ตารางหน่วยการเรียนรู้" color="brand" />
              <UploadZone file={loFiles.analysis} onFileChange={e => handleFileUpload(e, 'analysis')} label="2. ตารางวิเคราะห์งาน" color="purple" />
              <button onClick={generate} disabled={loLoading || !loFiles.units || !loFiles.analysis}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {loLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างผลลัพธ์การเรียนรู้
              </button>
            </>
          )}
        </div>

        <div className="md:col-span-2">
          {loLoading ? <LoadingOverlay text={loadingText} /> : loResults ? (
            <div className="space-y-4 animate-slide-up">
              <ResultHeader title="วิเคราะห์เสร็จสิ้น!" count={loResults.length}
                onRegenerate={generate} onExportWord={exportWord} onExportPdf={exportPdf} requireRegistration={requireRegistration} />
              <div className="overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50"><tr><th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-1/3">หน่วยการเรียนรู้</th><th className="px-4 py-3 text-left text-xs font-bold text-surface-700">ผลลัพธ์การเรียนรู้</th></tr></thead>
                  <tbody className="bg-white divide-y divide-surface-100">
                    {loResults.map((item, idx) => (
                      <tr key={idx}><td className="px-4 py-3 text-sm font-medium text-surface-900 align-top">{item.unitName}</td><td className="px-4 py-3 text-sm text-surface-600 align-top leading-relaxed">{item.outcome}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <NextStepBanner label="ไปสร้างสมรรถนะประจำหน่วย (Module 3)" onClick={() => setActiveMenu('competencies')} description="ระบบจะส่งผลลัพธ์การเรียนรู้ไปดำเนินการต่อ" />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-surface-400 min-h-[300px] border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50">
              <span className="text-4xl mb-2 opacity-30">🎯</span><p className="text-sm">ผลลัพธ์จะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
