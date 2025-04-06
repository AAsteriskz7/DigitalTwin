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
      AI-driven health insights, personalized for you.
       <br /> Step into the future of proactive care, powered by intelligent technology.
      </h4>

      <button className="demo-btn" onClick={() => navigate('/form')}>
        Demo
      </button>
    </div>
  );
}

export default HomePage;

