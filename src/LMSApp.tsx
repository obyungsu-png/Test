import { useState, useEffect } from "react";
import LMSHeader from "./components/LMS/LMSHeader";
import LMSSidebar from "./components/LMS/LMSSidebar";
import LMSMainContent from "./components/LMS/LMSMainContent";
import LMSFooter from "./components/LMS/LMSFooter";
import { Toaster } from "./components/ui/sonner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  subscriptionPeriod: '1month' | '3months' | '6months' | '1year';
  subscriptionStart: string;
  subscriptionEnd: string;
  status: 'active' | 'inactive' | 'expired';
}

interface LMSAppProps {
  initialSelectedMenu?: string;
  onExitClick?: () => void;
}

export default function LMSApp({ initialSelectedMenu = "dashboard", onExitClick }: LMSAppProps) {
  const [selectedMenu, setSelectedMenu] = useState(initialSelectedMenu);
  const [selectedSubject, setSelectedSubject] = useState("국어");

  // Update selected menu when initialSelectedMenu changes
  useEffect(() => {
    setSelectedMenu(initialSelectedMenu);
  }, [initialSelectedMenu]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LMSHeader onExitClick={onExitClick} />
      
      <div className="flex-1 flex">
        <LMSSidebar 
          selectedMenu={selectedMenu}
          onMenuSelect={setSelectedMenu}
        />
        
        <div className="flex-1 flex flex-col">
          <LMSMainContent 
            selectedMenu={selectedMenu}
            selectedSubject={selectedSubject}
            onSubjectSelect={setSelectedSubject}
            onMenuSelect={setSelectedMenu}
          />
        </div>
      </div>
      
      <LMSFooter />
      <Toaster />
    </div>
  );
}