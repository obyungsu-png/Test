import { useState, useEffect } from "react";
import LMSDashboard from "./LMSDashboard";
import LMSUserManagement from "./LMSUserManagement";
import LMSContentManagement from "./LMSContentManagement";
import LMSCategoryManagement from "./LMSCategoryManagement";
import LMSSiteManagement from "./LMSSiteManagement";
import LMSUpload from "./LMSUpload";
import LMSDownloadManagement from "./LMSDownloadManagement";
import LMSReports from "./LMSReports";
import LMSSchedule from "./LMSSchedule";
import LMSNotices from "./LMSNotices";
import LMSSettings from "./LMSSettings";

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
      case "categories":
        return <LMSCategoryManagement />;
      case "site-management":
        return <LMSSiteManagement />;
      case "upload":
        return <LMSUpload 
          selectedSubject={selectedSubject} 
          onNavigateToContent={() => onMenuSelect?.('content')}
        />;
      case "downloads":
        return <LMSDownloadManagement />;
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