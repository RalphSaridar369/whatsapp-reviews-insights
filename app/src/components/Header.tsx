import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="py-2 px-6 flex justify-between">
      <div>
        <h2><span style={{color:'#25D366'}}>Whatsapp</span> Reviews Anaylsis</h2>
      </div>
      <div className="cursor-pointer" onClick={toggleTheme}>
        {theme === "light" ? (
          <Moon className="text-text" size={32} />
        ) : (
          <Sun className="text-text" size={32} />
        )}
      </div>
    </div>
  );
};

export default Header;
