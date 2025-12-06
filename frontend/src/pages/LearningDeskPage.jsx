import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FocusSessionTab from "../components/LearningDesk/FocusSessionTab/FocusSessionTab";
import InterviewPrepTab from "../components/LearningDesk/InterviewPrepTab/InterviewPrepTab";
import KeywordExtractorTab from "../components/LearningDesk/KeywordExtractorTab/KeywordExtractorTab";
import LibraryTab from "../components/LearningDesk/LibraryTab/LibraryTab";
import SidebarLayout from "../components/SidebarLayout";
import { Clock, Calendar, Briefcase, Sparkles, BookOpen } from "lucide-react";

const LearningDeskPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quizInitialData, setQuizInitialData] = useState(null);

  // Get active tab from URL hash, default to "focus"
  const getActiveTabFromHash = () => {
    const hash = location.hash.replace("#", "");
    return hash || "focus";
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromHash());

  // Sync state with URL hash
  useEffect(() => {
    const newTab = getActiveTabFromHash();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.hash]);

  // Update URL hash when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`#${tabId}`, { replace: true });
  };

  const tabs = [
    { id: "focus", label: "Focus Sessions", icon: Clock },
    { id: "library", label: "My Library", icon: BookOpen },
    { id: "interview", label: "AI Interview Prep", icon: Briefcase },
    { id: "keywords", label: "AI Keyword Extractor", icon: Sparkles },
    { id: "calendar", label: "Study Calendar", icon: Calendar },
  ];

  const handleCreateQuizFromKeywords = (keywords) => {
    const keywordsString = keywords.map(k => k.text).join(", ");
    setQuizInitialData({
      description: `Create a quiz based on these keywords: ${keywordsString}`,
    });
    handleTabChange("interview");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "focus":
        return <FocusSessionTab />;
      case "library":
        return <LibraryTab />;
      case "interview":
        return (
          <InterviewPrepTab
            initialData={quizInitialData}
            onDataConsumed={() => setQuizInitialData(null)}
          />
        );
      case "keywords":
        return <KeywordExtractorTab onCreateQuiz={handleCreateQuizFromKeywords} />;
      case "calendar":
        return <div>Calendar Coming Soon...</div>;
      default:
        return null;
    }
  };

  return (
    <SidebarLayout
      activeItem={activeTab}
      setActiveItem={handleTabChange}
      navItems={tabs}
      title={"Learning Desk"}
    >
      {renderContent()}
    </SidebarLayout>
  );
};

export default LearningDeskPage;
