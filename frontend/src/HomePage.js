import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>
      <div className="blur blur3"></div>
      <div className="blur blur4"></div>

      <h1 className="title">DigitalTwin</h1>
      <h4 className="subtitle">
        Here goes your comments about <br /> the app that we will insert here
      </h4>

      <button className="demo-btn" onClick={() => navigate('/form')}>
        Demo
      </button>
    </div>
  );
}

export default HomePage;

