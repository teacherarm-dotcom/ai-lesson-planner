import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { extractFileData, prepareFileForAI } from '../../utils/fileHelpers';
import { cleanAndParseJSON } from '../../utils/tableUtils';
import { printToPdf, createWordDoc } from '../../utils/exportUtils';
import { PROMPT_COMPETENCY } from '../../prompts/systemPrompts';
import { ModuleHeader, SectionCard, UploadZone, AutoModeBadge, LoadingOverlay, ResultHeader, NextStepBanner } from '../common';

export default function CompetencyModule() {
  const app = useApp();
  const { callAI } = useAI();
  const { loResults, unitDivisionPlan, compFile, setCompFile, compLoading, setCompLoading,
    compResults, setCompResults, selectedLevel, setSelectedLevel,
    loadingText, setLoadingText, setError, handleError, setActiveMenu, requireRegistration, formData } = app;

  const hasPrevData = loResults && unitDivisionPlan;

  const handleFileUpload = async (e) => {
    try { setCompFile(await extractFileData(e.target.files[0])); } catch (err) { setError(err.message); }
  };

  const generate = async () => {
    if (!hasPrevData && !compFile) { setError('กรุณาแนบไฟล์ก่อน'); return; }
    setCompLoading(true); setLoadingText(`กำลังเขียนสมรรถนะ (${selectedLevel})...`);
    try {
      const contents = [];
      if (hasPrevData && !compFile) {
        const text = loResults.map(u => `Unit: ${u.unitName}\nOutcome: ${u.outcome}`).join('\n\n');
        contents.push({ type: 'text', data: `\n--- ข้อมูลหน่วยและผลลัพธ์ ---\n${text}` });
      } else if (compFile) {
        contents.push(prepareFileForAI(compFile, 'ข้อมูลหน่วยการเรียนรู้'));
      }
      const result = await callAI(PROMPT_COMPETENCY(selectedLevel), contents.filter(Boolean), { requireJson: true });
      const data = cleanAndParseJSON(result);
      if (data?.units) setCompResults(data.units);
      else throw new Error('Invalid format');
    } catch (err) { handleError(err, 'เกิดข้อผิดพลาด'); }
    finally { setCompLoading(false); }
  };

  const exportWord = () => {
    if (!compResults) return;
    const rows = compResults.map((item, idx) => {
      const list = item.competencies.map(c => `<li>${c}</li>`).join('');
      return `<tr><td style="text-align:center;vertical-align:top;">${idx+1}</td><td style="vertical-align:top;">${item.unitName}</td><td style="vertical-align:top;"><ul style="margin:0;padding-left:20px;">${list}</ul></td></tr>`;
    }).join('');
    createWordDoc(`สมรรถนะประจำหน่วย_${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วยการเรียนรู้</th><th>สมรรถนะประจำหน่วย</th></tr></thead><tbody>${rows}</tbody></table>`);
  };
  const exportPdf = () => {
    if (!compResults) return;
    const rows = compResults.map((item, idx) => {
      const list = item.competencies.map(c => `<li>${c}</li>`).join('');
      return `<tr><td style="text-align:center;">${idx+1}</td><td>${item.unitName}</td><td><ul>${list}</ul></td></tr>`;
    }).join('');
    printToPdf(`สมรรถนะประจำหน่วย ${formData.courseCode}`, `<table><thead><tr><th>ที่</th><th>หน่วย</th><th>สมรรถนะ</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  return (
    <SectionCard className="min-h-[80vh]">
      <ModuleHeader emoji="⚡" title="สมรรถนะประจำหน่วย" subtitle="วิเคราะห์สมรรถนะ (ทางปัญญา & ปฏิบัติงาน) ตามระดับหลักสูตร" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">ระดับชั้น</label>
            <div className="flex gap-2">
              {['ปวช.', 'ปวส.'].map(lv => (
                <button key={lv} onClick={() => setSelectedLevel(lv)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition ${selectedLevel === lv ? (lv === 'ปวช.' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-purple-500 bg-purple-50 text-purple-700') : 'border-surface-200 text-surface-500 hover:bg-surface-50'}`}>
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {hasPrevData ? (
            <div className="space-y-4">
              <AutoModeBadge moduleName="Module 2" />
              <button onClick={generate} disabled={compLoading} className="btn-primary w-full !py-3">
                {compLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างสมรรถนะทันที
              </button>
            </div>
          ) : (
            <>
              <UploadZone file={compFile} onFileChange={handleFileUpload} label="แนบไฟล์ผลลัพธ์การเรียนรู้" className="min-h-[180px]" />
              <button onClick={generate} disabled={compLoading || !compFile}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
                {compLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />} สร้างสมรรถนะ
              </button>
            </>
          )}
        </div>

        <div className="md:col-span-2">
          {compLoading ? <LoadingOverlay text={loadingText} /> : compResults ? (
            <div className="space-y-4 animate-slide-up">
              <ResultHeader title="สร้างสมรรถนะสำเร็จ!" count={compResults.length}
                onRegenerate={generate} onExportWord={exportWord} onExportPdf={exportPdf} requireRegistration={requireRegistration} />
              <div className="overflow-x-auto border border-surface-200 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-surface-200">
                  <thead className="bg-surface-50"><tr><th className="px-4 py-3 text-left text-xs font-bold text-surface-700 w-1/3">หน่วย</th><th className="px-4 py-3 text-left text-xs font-bold text-surface-700">สมรรถนะ</th></tr></thead>
                  <tbody className="bg-white divide-y divide-surface-100">
                    {compResults.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-surface-900 align-top">{item.unitName}</td>
                        <td className="px-4 py-3 text-sm text-surface-600 align-top">
                          <ul className="space-y-1.5">
                            {item.competencies.map((c, ci) => (
                              <li key={ci} className="flex gap-2"><span className="font-bold text-brand-600 min-w-[20px]">{ci+1}.</span><span>{c.replace(/^\d+\.\s*/, '')}</span></li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <NextStepBanner label="ไปสร้างจุดประสงค์เชิงพฤติกรรม (Module 4)" onClick={() => setActiveMenu('objectives')} description="ระบบจะส่งสมรรถนะไปดำเนินการต่อ" />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-surface-400 min-h-[300px] border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50">
              <span className="text-4xl mb-2 opacity-30">⚡</span><p className="text-sm">สมรรถนะจะแสดงที่นี่</p>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
