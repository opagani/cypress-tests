import React from "react";
import { ThemeProvider } from 'styled-components';
import { ThemeConstellation, ToastProvider } from '@zillow/constellation';

import TriggerTestPage from "./pages/TriggerTestPage";

class App extends React.Component {
  render() {
    return (
      <ThemeProvider theme={ThemeConstellation}>
        <ToastProvider>
          <TriggerTestPage />
        </ToastProvider>
      </ThemeProvider>
    );
  }
}

export default App;
