/* @jsxImportSource @emotion/react */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { css, Global } from "@emotion/react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Global
      styles={css`
        * {
          margin: 0;
          box-sizing: border-box;
        }

        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 5px;
          background-color: '#ccc';
        }

        &::-webkit-scrollbar-track {
          background-color: transparent;
        }

        .react-calendar-timeline {
          overflow: hidden;
        }
        .rct-calendar-header {
          border-bottom: 1px solid #1b1f20;
        }
        .rct-dateHeader {
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.1px;
          color: #787c84;
        }
        .rct-outer {
          display: flex;
        }
        .rct-vl {
          position: absolute;
          border-right: 1px solid #1b1f20;
        }
        .rct-hl-even,
        .rct-hl-odd {
          border-bottom: 1px solid #1b1f20;
        }
        .rct-sidebar {
          border-right: 1px solid #1b1f20;
        }
        .rct-sidebar-row {
          display: flex;
          align-items: center;
          padding: 0 15px;
          border-bottom: 1px solid #1b1f20;
        }
        .rct-scroll {
          overflow: hidden;
        }
      `}
    />
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
