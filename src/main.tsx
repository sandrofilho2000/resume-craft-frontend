import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ResumeProvider } from "./contexts/ResumeContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ResumeProvider>
    <App />
  </ResumeProvider>
);
