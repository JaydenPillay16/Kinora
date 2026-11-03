
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./Components/branding/ThemeProvider";
import { FeedbackProvider } from "./Components/feedback/FeedbackProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </ThemeProvider>
  </StrictMode>,
);
