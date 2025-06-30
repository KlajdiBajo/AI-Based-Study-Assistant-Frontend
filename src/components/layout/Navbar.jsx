import { Search, Sun, Moon } from "lucide-react";

import { Profile } from "../../components";
import { useTheme } from "../../hooks";

const Navbar = ({ user }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <Profile user={user} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;