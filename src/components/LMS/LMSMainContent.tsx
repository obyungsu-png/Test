import { useState, useEffect } from "react";
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
import LMSSGRWriting from "./LMSSGRWriting";
import LMSSGRVoca from "./LMSSGRVoca";
import { VocaManagement } from "../VocaManagement";

interface LMSMainContentProps {
  selectedMenu: string;
  selectedSubject: string;
  onSubjectSelect: (subject: string) => void;
  onMenuSelect?: (menu: string) => void;
}

export default function LMSMainContent({ 
  selectedMenu, 
  selectedSubject, 
  onSubjectSelect,
  onMenuSelect
}: LMSMainContentProps) {
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
      case "sgr-class":
        return <LMSSGRClass />;
      case "sgr-writing":
        return <LMSSGRWriting />;
      case "sgr-voca":
        return <LMSSGRVoca />;
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
        {renderContent()}
      </div>
    </main>
  );
}