
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/pages/HomePage";
import HelpPage from "@/pages/HelpPage";
import ExportHistoryPage from "@/pages/ExportHistoryPage";
import SettingsPage from "@/pages/SettingsPage";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("home");

  // Persist the active page in localStorage to prevent losing it on refresh
  useEffect(() => {
    const savedPage = localStorage.getItem('csv-sync-active-page');
    if (savedPage) {
      setActivePage(savedPage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('csv-sync-active-page', activePage);
  }, [activePage]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "home":
        return <HomePage />;
      case "help":
        return <HelpPage />;
      case "history":
        return <ExportHistoryPage />;
      case "upload":
        return <HomePage />;
      case "export":
        // This will just show the home page where export options are available
        return <HomePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          activePage={activePage}
          setActivePage={setActivePage}
        />
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen ? "md:ml-56" : "md:ml-14"
        }`}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
