
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Database, 
  Settings, 
  Home, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar = ({ isOpen, toggleSidebar, activePage, setActivePage }: SidebarProps) => {
  const menuItems = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "upload", label: "Upload CSV", icon: Upload },
    { id: "manage", label: "Manage Files", icon: FileText },
    { id: "backups", label: "Backups", icon: Database },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help & Docs", icon: HelpCircle },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-50 dark:bg-gray-900 border-r transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-14"
      } ${isOpen ? "w-56" : "w-14"}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && <h2 className="font-bold text-lg">Menu</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="ml-auto"
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={activePage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${
                  !isOpen ? "justify-center p-2" : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <item.icon className={`h-5 w-5 ${activePage === item.id ? "text-csvManager" : ""}`} />
                {isOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          {isOpen && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV Sync Manager v1.0
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
