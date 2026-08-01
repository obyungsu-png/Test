import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import { SessionProvider } from "./session/SessionContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <SessionProvider>
      <App />
    </SessionProvider>
  </HashRouter>
);
