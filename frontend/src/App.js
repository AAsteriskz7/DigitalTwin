import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Test from './Test';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/test">Test</Link>
      </nav>
      <Routes>
        <Route exact path="/" element={
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>Edit <code>src/App.js</code> and save to reload.</p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          </div>
        } />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
