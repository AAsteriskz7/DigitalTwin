import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>
      <div className="blur blur3"></div>
      <div className="blur blur4"></div>

      <h1 className="title">
        Digital T
        <span className="animated-twin">
        <Typewriter
  words={['T', '', 'win']}
  loop={1}
  cursor
  cursorStyle="_"
  typeSpeed={120}      // ↓ from 200
  deleteSpeed={80}     // ↓ from 100
  delaySpeed={400}     // ↓ from 1000
/>

        </span>
      </h1>

      <h4 className="subtitle">
        AI-driven health insights, personalized for you.
        <br />
        Step into the future of proactive care, powered by intelligent technology.
      </h4>

      <button className="demo-btn" onClick={() => navigate('/dataone')}>
        Demo
      </button>
    </div>
  );
}

export default HomePage;
