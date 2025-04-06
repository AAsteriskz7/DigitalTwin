import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResultsPage.css';
import axios from 'axios'; // You'll need to install axios: npm install axios

// Dummy form data that would be submitted to the backend
const dummyFormData = {
  age: 35,
  gender: "male",
  weight: 75, // in kg
  height: 175, // in cm
  BMI: 24.5,
  freq_moderate_activity: 3, // days per week
  freq_intense_activity: 2, // days per week
  mins_sedentary: 480, // minutes per day
  sleep_weekdays: 7, // hours
  sleep_weekends: 8, // hours
  smoked_100_cigarettes: 0,
  smoke: 0,
  tobacco: 0,
  blood_pressure: 120, // systolic
  cholesterol: 180 // mg/dL
};

// Dummy backend response that simulates API response
const dummyBackendResponse = {
  status: "success",
  predicted_age: 32.5, // biological age
  percentiles: {
    "Physical Activity": {
      percentile: 78.3
    },
    "Sleep Quality": {
      percentile: 65.2
    },
    "Smoking Habits": {
      percentile: 92.1
    },
    "Blood Pressure": {
      percentile: 72.4
    },
    "Cholesterol": {
      percentile: 68.7
    },
    "BMI": {
      percentile: 81.5
    }
  }
};

function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [useDummyData, setUseDummyData] = useState(false); // Add this line
  
  useEffect(() => {
    // Get form data from location state
    const formData = location.state?.formData;
    
    if (!formData) {
      // If no form data, show a message but don't stop rendering
      console.warn("No form data found in location state");
      
      // Option 1: Show error (your current behavior)
      if (!useDummyData) {
        setError("No form data found. Please fill out the assessment form.");
        setLoading(false);
      } else {
        // If using dummy data, proceed with dummy data
        fetchResults(dummyFormData);
      }
      return;
    }
    
    // Call the backend API
    fetchResults(formData);
  }, [location.state, useDummyData]);
  
  const fetchResults = async (formData) => {
    try {
      setLoading(true);

      if (useDummyData) {
        console.log("Using dummy data instead of API call");
        setTimeout(() => {
          const backendData = dummyBackendResponse;
          
          if (backendData.status === 'success') {
            const processedData = {
              biologicalAge: backendData.predicted_age,
              chronologicalAge: Number(dummyFormData.age), // Get chronological age from form data
              healthScore: calculateHealthScore(backendData),
              percentileScores: transformPercentiles(backendData.percentiles),
              healthRisks: generateHealthRisks(backendData)
            };
            
            setResultData(processedData);
            setLoading(false);
          }
        }, 1500); // Simulate API delay
        return;
      }
      
      // Replace with your actual backend URL
      const response = await axios.post('http://localhost:5000/predict', formData);
      
      // Process the backend response and format it for our UI
      const backendData = response.data;
      
      if (backendData.status === 'success') {
        // Transform backend data to match our component's expected format
        const processedData = {
          biologicalAge: backendData.predicted_age,
          chronologicalAge: Number(formData.age), // Get chronological age from form data
          healthScore: calculateHealthScore(backendData),
          percentileScores: transformPercentiles(backendData.percentiles),
          healthRisks: generateHealthRisks(backendData)
        };
        
        setResultData(processedData);
      } else {
        setError("Failed to calculate results. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("An error occurred while calculating your results. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions to process backend data
  const calculateHealthScore = (backendData) => {
    // Simple algorithm to calculate overall health score from percentiles
    // You can adjust this based on your specific requirements
    const percentiles = backendData.percentiles;
    const values = Object.values(percentiles).map(item => item.percentile);
    
    if (values.length === 0) return 50; // Default value
    
    // Calculate average of all percentiles
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  };
  
  const transformPercentiles = (backendPercentiles) => {
    // Transform backend percentiles to format expected by the UI
    const transformed = {};
    
    Object.entries(backendPercentiles).forEach(([key, data]) => {
      // Convert "Physical Activity" to camelCase "physicalActivity"
      const camelKey = key.toLowerCase()
        .replace(/\s(.)/g, (_, char) => char.toUpperCase())
        .replace(/\s/g, '');
      
      transformed[camelKey] = data.percentile;
    });
    
    return transformed;
  };
  
  const generateHealthRisks = (backendData) => {
    // Generate health risk assessments based on percentiles
    // This is a simple example - you might want to implement more sophisticated logic
    const risks = {};
    const percentiles = backendData.percentiles;
    
    // Heart health assessment
    if (percentiles["Blood Pressure"] || percentiles["Cholesterol"]) {
      const bpScore = percentiles["Blood Pressure"]?.percentile || 50;
      const cholScore = percentiles["Cholesterol"]?.percentile || 50;
      const avgScore = (bpScore + cholScore) / 2;
      
      risks.heart = {
        risk: avgScore > 70 ? 'low' : avgScore > 40 ? 'medium' : 'high',
        reason: avgScore > 70 
          ? 'Good blood pressure and cholesterol levels' 
          : 'Consider monitoring blood pressure and cholesterol'
      };
    }
    
    // Lung health assessment
    if (percentiles["Smoking Habits"]) {
      const smokeScore = percentiles["Smoking Habits"]?.percentile || 50;
      
      risks.lungs = {
        risk: smokeScore > 70 ? 'low' : smokeScore > 40 ? 'medium' : 'high',
        reason: smokeScore > 70 
          ? 'Good respiratory health' 
          : 'Smoking habits may affect lung health'
      };
    }
    
    // Metabolic health assessment
    if (percentiles["BMI"]) {
      const bmiScore = percentiles["BMI"]?.percentile || 50;
      
      risks.diabetes = {
        risk: bmiScore > 70 ? 'low' : bmiScore > 40 ? 'medium' : 'high',
        reason: bmiScore > 70 
          ? 'Healthy body mass index' 
          : 'BMI suggests potential metabolic health concerns'
      };
    }
    
    return risks;
  };
  
  // Enhanced function to determine percentile color with more gradations
  const getPercentileColor = (value) => {
    if (value >= 90) return '#00a1ff'; // Excellent - bright teal
    if (value >= 75) return '#00a1ff'; // Very good - teal
    if (value >= 60) return '#00b2ff'; // Good - blue
    if (value >= 45) return '#00b2ff'; // Fair - darker blue
    if (value >= 30) return '#00b3ff'; // Needs improvement - orange
    if (value >= 15) return '#00b3ff'; // Poor - darker orange
    return '#e74c3c';                  // Very poor - red
  };
  
  // Calculate position on the health bar (0-100%)
  const healthBarPosition = resultData 
    ? Math.min(100, Math.max(0, ((resultData.biologicalAge / resultData.chronologicalAge) * 100 - 70)))
    : 50;
    
  // Show loading state
  if (loading) {
    return (
      <div className="results-container">
        <h2 className="results-header">Calculating Your Results...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Update your error display section to include a "Use Dummy Data" option
  if (error) {
    return (
      <div className="results-container">
        <h2 className="results-header">Oops! Something went wrong</h2>
        <p className="error-message">{error}</p>
        <div className="button-container">
          <button className="nav-button" onClick={() => navigate('/form')}>Back to Form</button>
          <button 
            className="nav-button primary-button" 
            onClick={() => {
              setUseDummyData(true);
              setError(null);
              setLoading(true);
              // Process dummy data
              setTimeout(() => {
                const backendData = dummyBackendResponse;
                const processedData = {
                  biologicalAge: backendData.predicted_age,
                  chronologicalAge: Number(dummyFormData.age),
                  healthScore: calculateHealthScore(backendData),
                  percentileScores: transformPercentiles(backendData.percentiles),
                  healthRisks: generateHealthRisks(backendData)
                };
                setResultData(processedData);
                setLoading(false);
              }, 1500);
            }}
          >
            Use Demo Data
          </button>
        </div>
      </div>
    );
  }
  
  // If no result data yet, show message
  if (!resultData) {
    return (
      <div className="results-container">
        <h2 className="results-header">No Results Available</h2>
        <p>Please complete the assessment form to see your results.</p>
        <div className="button-container">
          <button className="nav-button" onClick={() => navigate('/form')}>Go to Assessment</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="results-container">
      <h2 className="results-header">Your Biological Age: {resultData.biologicalAge}</h2>      
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
              {resultData.healthRisks?.heart && (
                <div className={`risk-indicator heart-indicator risk-${resultData.healthRisks.heart.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Heart Health</span>
                    <p>{resultData.healthRisks.heart.reason}</p>
                  </div>
                </div>
              )}
              
              {resultData.healthRisks?.lungs && (
                <div className={`risk-indicator lungs-indicator risk-${resultData.healthRisks.lungs.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Lung Health</span>
                    <p>{resultData.healthRisks.lungs.reason}</p>
                  </div>
                </div>
              )}
              
              {resultData.healthRisks?.brain && (
                <div className={`risk-indicator brain-indicator risk-${resultData.healthRisks.brain.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Brain Health</span>
                    <p>{resultData.healthRisks.brain.reason}</p>
                  </div>
                </div>
              )}
              
              {resultData.healthRisks?.diabetes && (
                <div className={`risk-indicator diabetes-indicator risk-${resultData.healthRisks.diabetes.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Metabolic Health</span>
                    <p>{resultData.healthRisks.diabetes.reason}</p>
                  </div>
                </div>
              )}
              
              {resultData.healthRisks?.joints && (
                <div className={`risk-indicator joints-indicator risk-${resultData.healthRisks.joints.risk}`}>
                  <div className="indicator-line"></div>
                  <div className="risk-tooltip">
                    <span className="risk-title">Joint Health</span>
                    <p>{resultData.healthRisks.joints.reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Percentile Scores Section */}
        <div className="percentile-container">
          <h3>Your Health Percentiles</h3>
          <div className="percentile-scores">
            {Object.entries(resultData.percentileScores).map(([key, value]) => (
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
          <p className="result-value">{resultData.biologicalAge}</p>
          <p>Your body is functioning as if you were {resultData.biologicalAge} years old.</p>
        </div>
        
        <div className="result-block">
          <h3>Age Difference</h3>
          <p className="result-value">
            {resultData.chronologicalAge - resultData.biologicalAge > 0 ? '+' : ''}
            {(resultData.chronologicalAge - resultData.biologicalAge).toFixed(1)} years
          </p>
          <p>
            {resultData.chronologicalAge > resultData.biologicalAge 
              ? "Your biological age is lower than your actual age. Great job!" 
              : "Your biological age is higher than your actual age. Some lifestyle changes may help."}
          </p>
        </div>
        
        <div className="result-block">
          <h3>Health Score</h3>
          <p className="result-value">{resultData.healthScore}/100</p>
          <p>This score represents your overall health based on the assessment.</p>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="button-container">
        <button className="nav-button" onClick={() => navigate('/main')}>Go to Main Page</button>
        <button className="nav-button" onClick={() => navigate('/form')}>Back to Form</button>
        <button 
          className="nav-button primary-button" 
          onClick={() => navigate('/recommendations', { state: { resultData } })}
        >
          Next
        </button>
        {/* Add this to your button container */}
        <button 
          className="nav-button" 
          onClick={() => {
            setUseDummyData(!useDummyData);
            setLoading(true);
            if (!useDummyData) {
              // Switch to dummy data
              setTimeout(() => {
                const backendData = dummyBackendResponse;
                const processedData = {
                  biologicalAge: backendData.predicted_age,
                  chronologicalAge: Number(dummyFormData.age),
                  healthScore: calculateHealthScore(backendData),
                  percentileScores: transformPercentiles(backendData.percentiles),
                  healthRisks: generateHealthRisks(backendData)
                };
                setResultData(processedData);
                setLoading(false);
                setError(null);
              }, 1500); // Simulate API delay
            } else {
              // Switch back to real data
              fetchResults(location.state?.formData || dummyFormData);
            }
          }}
        >
          {useDummyData ? "Use Real API" : "Use Test Data"}
        </button>
      </div>
    </div>
  );
}

export default ResultsPage;