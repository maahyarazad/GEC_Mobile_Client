import "./App.css";
import React from "react";
import Main from "./main";
import PrimeReact from "primereact/api";
import { BrowserRouter } from "react-router-dom";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { history } from "./utils/history/history";
import './styles';

PrimeReact.ripple = true;

function App() {
  
  
  return (
    <HistoryRouter
      history={history as any}
      basename={process.env.REACT_APP_PROXY}
    >
      <div className="App app-theme" style={{ height: "100vh" }}>
        
          <Main />
      </div>
    </HistoryRouter>
  );
}

export default App;
