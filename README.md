# 🎓 AI Lesson Planner — ผู้ช่วยครูอาชีวะ v2.0

ระบบ AI ช่วยจัดทำแผนการสอนฐานสมรรถนะ สำหรับครูอาชีวศึกษา (สอศ.) หลักสูตร 2567

## ✨ What's New in v2.0

### 🔌 Multi-AI Provider Support
เลือกใช้ AI ค่ายใดก็ได้:
- **Google Gemini** (Free tier available)
- **OpenAI GPT-4o** 
- **Anthropic Claude**

ต้องการเพิ่ม Provider ใหม่? เพียงสร้างไฟล์ใน `src/providers/` ที่ extend `BaseProvider` แล้ว register ใน `AIProviderFactory.js`

### 🎨 Redesigned UI
- ดีไซน์ใหม่ด้วย Tailwind CSS + Custom Design System
- Font: Prompt (หัวข้อ) + Sarabun (เนื้อหา) — ฟอนต์ไทยคุณภาพ
- Glass morphism, smooth animations, responsive layout
- Dark/light sidebar, gradient accents

### 📐 Clean Architecture
- **React Context** สำหรับ state management
- **Provider Pattern** สำหรับ AI abstraction
- **Component-based** แยก modules ชัดเจน

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── providers/          # AI Provider implementations
│   ├── BaseProvider.js      # Abstract interface
│   ├── GeminiProvider.js    # Google Gemini
│   ├── OpenAIProvider.js    # OpenAI GPT-4o
│   ├── ClaudeProvider.js    # Anthropic Claude
│   └── AIProviderFactory.js # Factory + registry
├── context/            # React Context (global state)
│   ├── AIContext.jsx        # AI provider management
│   └── AppContext.jsx       # App state management
├── components/
│   ├── layout/         # Sidebar, etc.
│   ├── common/         # Reusable components
│   ├── modals/         # ApiKey, Registration, PDF Splitter, Error
│   └── modules/        # 5 main modules
│       ├── AnalysisModule.jsx        # Module 1: Job-Duty-Task
│       ├── LearningOutcomesModule.jsx # Module 2: Unit LOs
│       ├── CompetencyModule.jsx       # Module 3: Unit Competencies
│       ├── ObjectivesModule.jsx       # Module 4: Behavioral Objectives
│       └── ConceptModule.jsx          # Module 5: Key Concepts
├── prompts/            # All AI system prompts
├── utils/              # Helpers (file, table, export)
├── App.jsx
├── main.jsx
└── index.css           # Tailwind + custom styles
```

## 🔧 Adding a New AI Provider

1. Create `src/providers/MyProvider.js`:
```javascript
import { BaseProvider } from './BaseProvider';

export class MyProvider extends BaseProvider {
  static get displayName() { return 'My AI'; }
  static get providerId() { return 'myai'; }
  // ... implement sendMessage() and validateKey()
}
```

2. Register in `AIProviderFactory.js`:
```javascript
import { MyProvider } from './MyProvider';
const PROVIDERS = [..., MyProvider];
```

Done! The UI will automatically show the new provider option.

## 📝 Modules

| Module | Function |
|--------|----------|
| 1. วิเคราะห์งาน | Job-Duty-Task Analysis + Unit Division |
| 2. ผลลัพธ์การเรียนรู้ | Unit Learning Outcomes |
| 3. สมรรถนะประจำหน่วย | Unit Competencies (Cognitive + Performance) |
| 4. จุดประสงค์เชิงพฤติกรรม | Behavioral Objectives (Bloom's 4 domains) |
| 5. สาระสำคัญ | Key Concepts synthesis |

## 🏗️ Tech Stack

- **React 18** + Vite
- **Tailwind CSS 3** — Custom design system
- **Framer Motion** — Animations (available)
- **Lucide React** — Icons
- **React Markdown** — Table rendering

## 📄 License

Developed by นายอำนาจ เสมอวงศ์ — ศสพ.ภาคใต้
