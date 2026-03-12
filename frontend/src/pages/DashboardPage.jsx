// pages/DashboardPage.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart,
  PlusCircle,
  ShoppingBasket,
  Globe,
  PackageSearch,
  MessageCircle,
  Users,
} from "lucide-react";

import SidebarLayout from "../components/SidebarLayout";
import CreateProductForm from "../components/Dashboard/CreateProductForm";
import UserProductsList from "../components/Dashboard/UserProductsList";
import GlobalProductsList from "../components/Dashboard/GlobalProductsList";
import UserAnalyticsTab from "../components/Dashboard/UserAnalyticsTab";
import GlobalAnalyticsTab from "../components/Dashboard/GlobalAnalyticsTab";
import FeedbackList from "../components/Dashboard/FeedbackList";
import UsersList from "../components/Dashboard/UserList";
import { useUserStore } from "../stores/useUserStore";
import { useProductStore } from "../stores/useProductStore";

const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "analytics";

  const { user } = useUserStore();
  const isAdmin = user?.role === "admin";

  const { fetchAllProducts, fetchMyProducts } = useProductStore();

  // Function to change tab (updates URL)
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllProducts();
    } else {
      fetchMyProducts();
    }
  }, [isAdmin, fetchAllProducts, fetchMyProducts]);

  const baseTabs = [
    { id: "analytics", label: "My Analytics", icon: BarChart },
    { id: "create", label: "Create Product", icon: PlusCircle },
    { id: "products", label: "My Products", icon: ShoppingBasket },
  ];

  const adminTabs = [
    ...baseTabs,
    { id: "global-analytics", label: "Global Analytics", icon: Globe },
    { id: "all-products", label: "All Products", icon: PackageSearch },
    { id: "users", label: "Users", icon: Users },
    { id: "feedback", label: "User Feedback", icon: MessageCircle },

  ];

  const tabs = isAdmin ? adminTabs : baseTabs;

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <UserAnalyticsTab />;
      case "create":
        return <CreateProductForm />;
      case "products":
        return <UserProductsList />;
      case "global-analytics":
        return <GlobalAnalyticsTab />;
      case "all-products":
        return <GlobalProductsList />;
      case "users":
        return <UsersList />;
      case "feedback":
        return <FeedbackList />;
      default:
        return <UserAnalyticsTab />;
    }
  };

  return (
    <SidebarLayout
      activeItem={activeTab}
      setActiveItem={setActiveTab}
      navItems={tabs}
      title={"Dashboard"}
    >
      {renderContent()}
    </SidebarLayout>
  );
};

export default DashboardPage;
