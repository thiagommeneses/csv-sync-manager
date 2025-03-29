
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "./Logo";
import { 
  FileText, 
  Upload, 
  History, 
  Settings, 
  Home, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar = ({ isOpen, toggleSidebar, activePage, setActivePage }: SidebarProps) => {
  const mainMenuItems = [
    { id: "home", label: "Início", icon: Home },
    { id: "upload", label: "Importar CSV", icon: Upload },
    { id: "history", label: "Histórico", icon: History },
    { id: "export", label: "Exportar", icon: Download },
  ];
  
  const secondaryMenuItems = [
    { id: "settings", label: "Configurações", icon: Settings },
    { id: "help", label: "Ajuda", icon: HelpCircle },
  ];

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r shadow-sm transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-14"
      } ${isOpen ? "w-56" : "w-14"}`}
    >
      <div className="flex items-center justify-between p-4">
        {isOpen && <Logo />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className={isOpen ? "ml-auto" : "mx-auto"}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          {isOpen && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
              Principal
            </div>
          )}
          <nav className="space-y-1">
            {mainMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activePage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${!isOpen ? "justify-center p-2" : ""} ${
                  activePage === item.id 
                    ? "bg-blue-50 text-csvManager dark:bg-gray-800 dark:text-blue-400" 
                    : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <item.icon className={`h-5 w-5 ${activePage === item.id ? "text-csvManager dark:text-blue-400" : ""}`} />
                {isOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto px-3">
          <Separator className="my-4" />
          <nav className="space-y-1">
            {secondaryMenuItems.map((item) => (
              <Button
                key={item.id}
                variant={activePage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start ${!isOpen ? "justify-center p-2" : ""} ${
                  activePage === item.id 
                    ? "bg-blue-50 text-csvManager dark:bg-gray-800 dark:text-blue-400" 
                    : ""
                }`}
                onClick={() => setActivePage(item.id)}
              >
                <item.icon className={`h-5 w-5 ${activePage === item.id ? "text-csvManager dark:text-blue-400" : ""}`} />
                {isOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          {isOpen && (
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV Sync Manager v1.2
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
