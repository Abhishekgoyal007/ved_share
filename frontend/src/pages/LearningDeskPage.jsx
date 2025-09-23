import { useState } from "react";
import { Clock, Calendar } from "lucide-react";
import SidebarLayout from "../components/SidebarLayout";
import PomodoroTab from "../components/LearningDesk/PomodoroTab/PomodoroTab";

const LearningDeskPage = () => {
  const [activeTab, setActiveTab] = useState("pomodoro");

  const tabs = [
    { id: "pomodoro", label: "Pomodoro Timer", icon: Clock },
    { id: "calendar", label: "Study Calendar", icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "pomodoro":
        return <PomodoroTab />;
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
