
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "./ThemeSwitcher";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-csvManager">CSV Sync Manager</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default Header;
