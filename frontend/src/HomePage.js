import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { Typewriter } from 'react-simple-typewriter';


function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>
      <div className="blur blur3"></div>
      <div className="blur blur4"></div>

      <h1 className="title">
  Digital Twin
</h1>

      <h4 className="subtitle">
      Build a simulation of your future self based on current habits.
       <br />  See how different changes affect your biological age trajectory.
      </h4>

      <button className="demo-btn" onClick={() => navigate('/dataone')}>
        Demo
      </button>
    </div>
  );
}

export default HomePage;

