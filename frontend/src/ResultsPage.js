import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsPage.css'; // Add this import line

function ResultsPage() {
  const navigate = useNavigate();
  
  // Sample data - Replace this with actual data from your form/calculation
  const sampleData = {
    biologicalAge: 42, // User's calculated biological age
    chronologicalAge: 45, // User's actual age
    healthScore: 78, // Score out of 100
    percentileScores: {
      physicalActivity: 74.7,
      sleep: 57.3,
      smokers: 57.3,
      bloodPressure: 63.3,
      cholesterol: 59.7,
      alcoholUse: 100.0,
      bmi: 9.4
    },
    healthRisks: {
      heart: {
        risk: 'medium',
        reason: 'High blood pressure and elevated cholesterol'
      },
      lungs: {
        risk: 'low',
        reason: 'Good respiratory health'
      }
      // Add other risk factors as needed
    }
  };
  
  // Calculate position on the health bar (0-100%)
  const healthBarPosition = Math.min(100, Math.max(0, 
    ((sampleData.biologicalAge / sampleData.chronologicalAge) * 100 - 70)));
  
  // Enhanced function to determine percentile color with more gradations
  const getPercentileColor = (value) => {
    if (value >= 90) return '#00ffe0'; // Excellent - bright teal
    if (value >= 75) return '#22f7e2'; // Very good - teal
    if (value >= 60) return '#14d0f6'; // Good - blue
    if (value >= 45) return '#147ff6'; // Fair - darker blue
    if (value >= 30) return '#f39c12'; // Needs improvement - orange
    if (value >= 15) return '#e67e22'; // Poor - darker orange
    return '#e74c3c';                  // Very poor - red
  };
  
  return (
    <div className="results-container">
      <h2 className="results-header">Your Biological Age Results</h2>
      
      {/* Health Indicator Bar */}
      <div className="health-bar-container">
        <div className="health-bar">
          <div className="health-marker" style={{ left: `${healthBarPosition}%` }}></div>
        </div>
        <div className="health-bar-labels">
          <span>Lower Risk</span>
          <span>Higher Risk</span>
        </div>
      </div>
      
      <div className="avatar-percentile-container">
        {/* Avatar Section */}
        <div className="avatar-container">
          <h3>Your Digital Twin</h3>
          
          <div className="avatar-visual">
            {/* Custom avatar image */}
            <div className="custom-avatar">
              <img src="/avatar-image.png" alt="Digital Twin Avatar" className="avatar-image" />
              
              {/* Health risk indicators as overlays */}
              {sampleData.healthRisks?.heart && (
                <div className={`risk-indicator heart-indicator risk-${sampleData.healthRisks.heart.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Heart Health</span>
                    <p>{sampleData.healthRisks.heart.reason}</p>
                  </div>
                </div>
              )}
              
              {sampleData.healthRisks?.lungs && (
                <div className={`risk-indicator lungs-indicator risk-${sampleData.healthRisks.lungs.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Lung Health</span>
                    <p>{sampleData.healthRisks.lungs.reason}</p>
                  </div>
                </div>
              )}
              
              {sampleData.healthRisks?.brain && (
                <div className={`risk-indicator brain-indicator risk-${sampleData.healthRisks.brain.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Brain Health</span>
                    <p>{sampleData.healthRisks.brain.reason}</p>
                  </div>
                </div>
              )}
              
              {sampleData.healthRisks?.diabetes && (
                <div className={`risk-indicator diabetes-indicator risk-${sampleData.healthRisks.diabetes.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Metabolic Health</span>
                    <p>{sampleData.healthRisks.diabetes.reason}</p>
                  </div>
                </div>
              )}
              
              {sampleData.healthRisks?.joints && (
                <div className={`risk-indicator joints-indicator risk-${sampleData.healthRisks.joints.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Joint Health</span>
                    <p>{sampleData.healthRisks.joints.reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="biological-age-card">
            <h4>Biological Age Summary</h4>
            <div className="age-comparison">
              <div className="age-item">
                <span className="age-label">Chronological Age</span>
                <span className="age-value">{sampleData.chronologicalAge}</span>
              </div>
              <div className="age-item">
                <span className="age-label">Biological Age</span>
                <span className="age-value">{sampleData.biologicalAge}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Percentile Scores Section */}
        <div className="percentile-container">
          <h3>Your Health Percentiles</h3>
          <div className="percentile-scores">
            {Object.entries(sampleData.percentileScores).map(([key, value]) => (
              <div className="percentile-item" key={key}>
                <div className="percentile-header">
                  <span className="percentile-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  <span className="percentile-value" style={{ color: getPercentileColor(value) }}>
                    {value.toFixed(1)}%
                  </span>
                </div>
                <div className="percentile-bar-bg">
                  <div 
                    className="percentile-bar-fill" 
                    style={{ 
                      width: `${value}%`, 
                      backgroundColor: getPercentileColor(value)
                    }}
                  ></div>
                </div>
                <span className="percentile-note">
                  Healthier than {value.toFixed(1)}% of population
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results Information Blocks */}
      <div className="results-content">
        <div className="result-block">
          <h3>Biological Age</h3>
          <p className="result-value">{sampleData.biologicalAge}</p>
          <p>Your body is functioning as if you were {sampleData.biologicalAge} years old.</p>
        </div>
        
        <div className="result-block">
          <h3>Age Difference</h3>
          <p className="result-value">
            {sampleData.chronologicalAge - sampleData.biologicalAge > 0 ? '+' : ''}
            {sampleData.chronologicalAge - sampleData.biologicalAge} years
          </p>
          <p>
            {sampleData.chronologicalAge > sampleData.biologicalAge 
              ? "Your biological age is lower than your actual age. Great job!" 
              : "Your biological age is higher than your actual age. Some lifestyle changes may help."}
          </p>
        </div>
        
        <div className="result-block">
          <h3>Health Score</h3>
          <p className="result-value">{sampleData.healthScore}/100</p>
          <p>This score represents your overall health based on the assessment.</p>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="button-container">
        <button className="nav-button" onClick={() => navigate('/main')}>Go to Main Page</button>
        <button className="nav-button" onClick={() => navigate('/form')}>Back to Form</button>
        <button className="nav-button primary-button" onClick={() => navigate('/recommendations')}>Next</button>
      </div>
    </div>
  );
}

export default ResultsPage;