import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // UI State
  const [activeMenu, setActiveMenu] = useState('analysis');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Registration State
  const [isRegistered, setIsRegistered] = useState(() => localStorage.getItem('userRegistered') === 'true');

  // Modal States
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isStandardPopupOpen, setIsStandardPopupOpen] = useState(false);
  const [isPdfToolOpen, setIsPdfToolOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // ===== Module 1: Analysis =====
  const [analysisStep, setAnalysisStep] = useState(1);
  const [courseFile, setCourseFile] = useState(null);
  const [hasStandard, setHasStandard] = useState(false);
  const [standardContent, setStandardContent] = useState('');
  const [standardFileName, setStandardFileName] = useState('');
  const [formData, setFormData] = useState({
    courseCode: '', courseName: '', credits: '', ratio: '', standardRef: '',
    learningOutcomes: '', objectives: '', competencies: '', description: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [unitDivisionPlan, setUnitDivisionPlan] = useState(null);
  const [dividingUnits, setDividingUnits] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('ปวช.');

  // ===== Module 2: Learning Outcomes =====
  const [loFiles, setLoFiles] = useState({ units: null, analysis: null });
  const [loLoading, setLoLoading] = useState(false);
  const [loResults, setLoResults] = useState(null);

  // ===== Module 3: Competencies =====
  const [compFile, setCompFile] = useState(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compResults, setCompResults] = useState(null);

  // ===== Module 4: Objectives =====
  const [objStep, setObjStep] = useState(1);
  const [objFiles, setObjFiles] = useState({ syllabus: null, competencies: null, outcomes: null });
  const [objLoading, setObjLoading] = useState(false);
  const [objResults, setObjResults] = useState(null);

  // ===== Module 5: Concepts =====
  const [conceptStep, setConceptStep] = useState(1);
  const [conceptFiles, setConceptFiles] = useState({ syllabus: null, analysis: null, units: null, outcomes: null, competencies: null, objectives: null });
  const [conceptLoading, setConceptLoading] = useState(false);
  const [conceptResults, setConceptResults] = useState(null);

  // Registration guard
  const requireRegistration = useCallback((action) => {
    if (isRegistered) {
      action();
    } else {
      setPendingAction(() => action);
      setIsRegModalOpen(true);
    }
  }, [isRegistered]);

  const handleRegistrationComplete = useCallback((userData) => {
    setIsRegistered(true);
    setIsRegModalOpen(false);
    localStorage.setItem('userRegistered', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  // Error handler
  const handleError = useCallback((err, fallbackMsg = 'เกิดข้อผิดพลาด') => {
    if (err.message === 'API_KEY_MISSING') {
      setError('กรุณาตั้งค่า API Key ก่อนเริ่มใช้งานครับ');
      setIsKeyModalOpen(true);
      return;
    }
    let msg = err.message;
    if (msg.includes('HTTP 401')) msg = 'API Key ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าถึง (HTTP 401)';
    else if (msg.includes('HTTP 400')) msg = 'ข้อมูลไม่ถูกต้อง หรือไฟล์ไม่รองรับ (HTTP 400)';
    else if (msg.includes('HTTP 413')) msg = 'ขนาดไฟล์ใหญ่เกินไป (HTTP 413)';
    else if (msg.includes('HTTP 429')) msg = 'API Key ติดข้อจำกัดโควต้า\nกรุณารอ 1 นาทีแล้วลองใหม่ครับ';
    else if (msg.includes('HTTP 50')) msg = 'เซิร์ฟเวอร์ AI มีปัญหา กรุณาลองใหม่ภายหลัง';
    setError(`${fallbackMsg}:\n${msg}`);
  }, []);

  const value = {
    // UI
    activeMenu, setActiveMenu,
    isMobileMenuOpen, setIsMobileMenuOpen,
    error, setError,
    loading, setLoading,
    loadingText, setLoadingText,
    // Modals
    isKeyModalOpen, setIsKeyModalOpen,
    isRegModalOpen, setIsRegModalOpen,
    isStandardPopupOpen, setIsStandardPopupOpen,
    isPdfToolOpen, setIsPdfToolOpen,
    // Registration
    isRegistered, requireRegistration, handleRegistrationComplete,
    // Module 1
    analysisStep, setAnalysisStep,
    courseFile, setCourseFile,
    hasStandard, setHasStandard,
    standardContent, setStandardContent,
    standardFileName, setStandardFileName,
    formData, setFormData,
    generatedPlan, setGeneratedPlan,
    unitDivisionPlan, setUnitDivisionPlan,
    dividingUnits, setDividingUnits,
    selectedLevel, setSelectedLevel,
    // Module 2
    loFiles, setLoFiles, loLoading, setLoLoading, loResults, setLoResults,
    // Module 3
    compFile, setCompFile, compLoading, setCompLoading, compResults, setCompResults,
    // Module 4
    objStep, setObjStep, objFiles, setObjFiles, objLoading, setObjLoading, objResults, setObjResults,
    // Module 5
    conceptStep, setConceptStep, conceptFiles, setConceptFiles, conceptLoading, setConceptLoading, conceptResults, setConceptResults,
    // Helpers
    handleError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within <AppProvider>');
  return context;
}
