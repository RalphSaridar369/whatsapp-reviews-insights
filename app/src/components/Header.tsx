import { useTheme } from "../context/ThemeContext";
import { FaMoon, FaSun, FaGithub } from "react-icons/fa";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="py-2 px-6 flex justify-between">
      <div>
        <h2>
          <span style={{ color: "#25D366" }}>Whatsapp</span> Reviews Analysis
        </h2>
      </div>
      <div className="flex flex-row gap-8">
        <div
          className="hover:cursor-pointer"
          onClick={() =>
            window.open("https://github.com/RalphSaridar369/whatsapp-reviews-insights", "_blank")
          }
        >
          <FaGithub className="text=text" size={32} />
        </div>
        <div className="hover:cursor-pointer" onClick={toggleTheme}>
          {theme === "light" ? (
            <FaMoon className="text-text" size={32} />
          ) : (
            <FaSun className="text-text" size={32} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
