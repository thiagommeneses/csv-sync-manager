
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/pages/HomePage";
import HelpPage from "@/pages/HelpPage";
import ExportHistoryPage from "@/pages/ExportHistoryPage";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("home");

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
        // Will implement settings page in future iterations
        return <HelpPage />;
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
