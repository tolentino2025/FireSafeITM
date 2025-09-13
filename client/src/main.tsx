import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Theme is now handled in index.html to prevent flicker

createRoot(document.getElementById("root")!).render(<App />);
