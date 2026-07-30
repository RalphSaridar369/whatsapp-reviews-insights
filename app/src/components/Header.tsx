import { useTheme } from "../context/ThemeContext";
import { Moon, Sun} from "lucide-react";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="py-2 px-6 flex justify-end">
      <div className="cursor-pointer" onClick={toggleTheme}>
        {theme === 'light' ? <Moon className="text-text" size={32}/> : <Sun className="text-text" size={32}/>}
      </div>
    </div>
  );
};

export default Header;
