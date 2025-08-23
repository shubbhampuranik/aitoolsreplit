import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "nprogress/nprogress.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(React.createElement(App));
}