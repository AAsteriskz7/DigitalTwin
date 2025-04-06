import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DataOne from './DataOne';
import DataTwo from './DataTwo';
import DataThree from './DataThree';
import MainPage from './MainPage';
import ResultsPage from './ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dataone" element={<DataOne />} />
        <Route path="/datatwo" element={<DataTwo />} />
        <Route path="/datathree" element={<DataThree />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
