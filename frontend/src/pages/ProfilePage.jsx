import { useState } from "react";
import SidebarLayout from "../components/SidebarLayout";

import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import UserAnalyticsTab from "../components/UserAnalyticsTab";

const ProfilePage = () => {
  const [activeItem, setActiveItem] = useState("create");

  return (
    <SidebarLayout activeItem={activeItem} setActiveItem={setActiveItem}>
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">My Profile</h1>

      {activeItem === "create" && <CreateProductForm />}
      {activeItem === "products" && <ProductsList />}
      {activeItem === "analytics" && <UserAnalyticsTab />}
    </SidebarLayout>
  );
};

export default ProfilePage;
