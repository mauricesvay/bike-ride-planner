import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    BikeRidePlanner: {
      jawg: {
        accessToken: string;
      };
    };
  }
}

window.BikeRidePlanner = {
  jawg: {
    accessToken:
      "tj4jikFbVaSWErkfn9ZzIndBB8vwaJQdZULMQ1uuyO9NGfDPvZj9rNPR5U0V0iQC",
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
