import { useState } from "react";
import LMSDashboard from "./LMSDashboard";
import LMSUserManagement from "./LMSUserManagement";
import LMSContentManagement from "./LMSContentManagement";
import LMSCategoryManagement from "./LMSCategoryManagement";
import LMSSiteManagement from "./LMSSiteManagement";
import LMSDownloadManagement from "./LMSDownloadManagement";
import LMSReports from "./LMSReports";
import LMSSchedule from "./LMSSchedule";
import LMSNotices from "./LMSNotices";
import LMSSettings from "./LMSSettings";
import LMSAdManagement from "./LMSAdManagement";
import LMSTextbookMastery from "./LMSTextbookMastery";
import LMSSGRClass from "./LMSSGRClass";
import LMSSGRNovel from "./LMSSGRNovel";
import LMSSGRWriting from "./LMSSGRWriting";
import LMSSGRVoca from "./LMSSGRVoca";
import LMSSGRGrammar from "./LMSSGRGrammar";
import LMSSGRHSK from "./LMSSGRHSK";
import { VocaManagement } from "../VocaManagement";
import { SGR_SCHOOL_LABEL, type SGRSchool } from "../../utils/sgrSchool";

const SGR_SECTIONS = [
  { id: "class", label: "Class" },
  { id: "novel", label: "Novels" },
  { id: "writing", label: "Writing" },
  { id: "voca", label: "Voca" },
  { id: "grammar", label: "Grammar" },
  { id: "hsk", label: "HSK" },
] as const;
const SGR_SCHOOL_PREF_KEY = "lmsSgrSchool";

interface LMSMainContentProps {
  selectedMenu: string;
  selectedSubject: string;
  onSubjectSelect: (subject: string) => void;
  sgrSection: string;
  onSgrSectionSelect: (section: string) => void;
}

export default function LMSMainContent({ 
  selectedMenu, 
  selectedSubject,
  onSubjectSelect,
  sgrSection,
  onSgrSectionSelect
}: LMSMainContentProps) {
  // SGR 관리: 한국학교 / 국제학교 SGR Series 자료를 따로 관리 (마지막 선택 기억)
  const [sgrSchool, setSgrSchool] = useState<SGRSchool>(() => {
    try {
      return localStorage.getItem(SGR_SCHOOL_PREF_KEY) === "international" ? "international" : "korean";
    } catch {
      return "korean";
    }
  });
  const changeSgrSchool = (school: SGRSchool) => {
    setSgrSchool(school);
    try { localStorage.setItem(SGR_SCHOOL_PREF_KEY, school); } catch { /* 기억 못 해도 동작에는 지장 없음 */ }
  };

  const isSgrMenu = selectedMenu === "sgr" || SGR_SECTIONS.some(({ id }) => selectedMenu === `sgr-${id}`);
  const activeSgrSection = SGR_SECTIONS.some(({ id }) => id === sgrSection) ? sgrSection : "class";
  const renderSgrSection = () => {
    switch (activeSgrSection) {
      case "novel": return <LMSSGRNovel key={sgrSchool} school={sgrSchool} />;
      case "writing": return <LMSSGRWriting key={sgrSchool} school={sgrSchool} />;
      case "voca": return <LMSSGRVoca key={sgrSchool} school={sgrSchool} />;
      case "grammar": return <LMSSGRGrammar key={sgrSchool} school={sgrSchool} />;
      case "hsk": return <LMSSGRHSK key={sgrSchool} school={sgrSchool} />;
      default: return <LMSSGRClass key={sgrSchool} school={sgrSchool} />;
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <LMSDashboard />;
      case "users":
        return <LMSUserManagement />;
      case "content":
        return <LMSContentManagement selectedSubject={selectedSubject} onSubjectSelect={onSubjectSelect} />;
      case "textbook-mastery":
        return <LMSTextbookMastery />;
      case "sgr":
      case "sgr-class":
      case "sgr-novel":
      case "sgr-writing":
      case "sgr-voca":
      case "sgr-grammar":
      case "sgr-hsk":
        return renderSgrSection();
      case "voca":
        return <VocaManagement />;
      case "categories":
        return <LMSCategoryManagement />;
      case "site-management":
        return <LMSSiteManagement />;
      case "downloads":
        return <LMSDownloadManagement />;
      case "ads":
        return <LMSAdManagement />;
      case "reports":
        return <LMSReports />;
      case "schedule":
        return <LMSSchedule />;
      case "notices":
        return <LMSNotices />;
      case "settings":
        return <LMSSettings />;
      default:
        return <LMSDashboard />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-4 lg:p-6">
        {isSgrMenu && (
          <>
            <nav aria-label="SGR 관리 영역" className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-3">
              {SGR_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSgrSectionSelect(id)}
                  aria-current={activeSgrSection === id ? "page" : undefined}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeSgrSection === id ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  SGR {label}
                </button>
              ))}
            </nav>
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <span className="text-sm font-bold text-gray-700">자료 대상</span>
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                {(["korean", "international"] as const).map((school) => (
                  <button
                    key={school}
                    onClick={() => changeSgrSchool(school)}
                    aria-pressed={sgrSchool === school}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      sgrSchool === school ? "bg-white text-cyan-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {SGR_SCHOOL_LABEL[school]} SGR Series
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                선택한 학교의 SGR Series에만 올라가요. 한국학교와 국제학교 자료는 서로 공유되지 않습니다.
              </p>
            </div>
          </>
        )}
        {renderContent()}
      </div>
    </main>
  );
}