import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { useAI } from './context/AIContext';
import Sidebar from './components/layout/Sidebar';
import ApiKeyModal from './components/modals/ApiKeyModal';
import ErrorPopup from './components/modals/ErrorPopup';
import RegistrationModal from './components/modals/RegistrationModal';
import PdfSplitterModal from './components/modals/PdfSplitterModal';
import AnalysisModule from './components/modules/AnalysisModule';
import LearningOutcomesModule from './components/modules/LearningOutcomesModule';
import CompetencyModule from './components/modules/CompetencyModule';
import ObjectivesModule from './components/modules/ObjectivesModule';
import ConceptModule from './components/modules/ConceptModule';

function AppContent() {
  const { activeMenu, setIsKeyModalOpen, formData, setSelectedLevel } = useApp();
  const { isReady } = useAI();

  // Auto-open API key modal if not configured
  useEffect(() => {
    if (!isReady) setIsKeyModalOpen(true);
  }, [isReady]);

  // Auto-detect level from courseCode
  useEffect(() => {
    if (formData.courseCode?.trim().startsWith('3')) setSelectedLevel('ปวส.');
    else setSelectedLevel('ปวช.');
  }, [formData.courseCode]);

  const renderModule = () => {
    switch (activeMenu) {
      case 'analysis': return <AnalysisModule />;
      case 'learning_outcomes': return <LearningOutcomesModule />;
      case 'competencies': return <CompetencyModule />;
      case 'objectives': return <ObjectivesModule />;
      case 'concept': return <ConceptModule />;
      default: return <AnalysisModule />;
    }
  };

  return (
    <div
      className="min-h-screen bg-surface-50 no-select pb-12"
      onCopy={(e) => {
        e.preventDefault();
        alert('กรุณากดปุ่ม Download หรือส่งออกเป็น Word/PDF แทนครับ');
      }}
    >
      {/* Modals */}
      <ApiKeyModal />
      <ErrorPopup />
      <RegistrationModal />
      <PdfSplitterModal />

      {/* Layout */}
      <div className="flex max-w-[1440px] mx-auto pt-4 lg:pt-4 px-4 gap-6 items-start">
        <Sidebar />

        <main className="flex-1 min-w-0 pt-14 lg:pt-0">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
