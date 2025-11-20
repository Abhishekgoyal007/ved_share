import { useState } from "react";
import { Clock, Calendar, Briefcase, Sparkles } from "lucide-react";
import SidebarLayout from "../components/SidebarLayout";
import FocusSessionTab from "../components/LearningDesk/FocusSessionTab/FocusSessionTab";
import InterviewPrepTab from "../components/LearningDesk/InterviewPrepTab/InterviewPrepTab";
import KeywordExtractorTab from "../components/LearningDesk/KeywordExtractorTab/KeywordExtractorTab";

const LearningDeskPage = () => {
  const [activeTab, setActiveTab] = useState("focus");

  const tabs = [
    { id: "focus", label: "Focus Sessions", icon: Clock },
    { id: "interview", label: "Interview Prep", icon: Briefcase },
    { id: "keywords", label: "Keyword Extractor", icon: Sparkles },
    { id: "calendar", label: "Study Calendar", icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "focus":
        return <FocusSessionTab />;
      case "interview":
        return <InterviewPrepTab />;
      case "keywords":
        return <KeywordExtractorTab />;
      case "calendar":
        return <div>Calendar Coming Soon...</div>;
      default:
        return null;
    }
  };

  return (
    <SidebarLayout
      activeItem={activeTab}
      setActiveItem={setActiveTab}
      navItems={tabs}
      title={"Learning Desk"}
    >
      {renderContent()}
    </SidebarLayout>
  );
};

export default LearningDeskPage;
