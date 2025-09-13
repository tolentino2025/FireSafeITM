import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Bootstrap theme detection - apply system preference if no saved theme
(() => {
  const saved = localStorage.getItem('theme');
  if (!saved) {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  } else if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
