import React, { useState, useEffect } from 'react';

const Test = () => {
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    Gender: '2.0',
    Age: '',
    blood_pressure: '2.0',
    cholesterol: '2.0',
    diabetes: '2.0',
    mins_sedentary: '',
    freq_moderate_activity: '',
    freq_intense_activity: '',
    smoked_100_cigarettes: '2.0',
    smoke: '2.0',
    tobacco: '2.0',
    weight_loss: '2.0',
    freq_alcohol: '',
    freq_physical_activity: '',
    sleep_weekdays: '',
    sleep_weekends: '',
    weight: '',
    height: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));
  }, []);

  const generateRandomData = () => {
    // Generate random data for all fields
    const randomData = {
      Gender: '2.0',
      blood_pressure: '2.0',
      cholesterol: '2.0',
      diabetes: '2.0',
      mins_sedentary: Math.floor(Math.random() * 600) + 100, // 100-700 mins
      freq_moderate_activity: Math.floor(Math.random() * 60) + 1, // 1-60
      freq_intense_activity: Math.floor(Math.random() * 30) + 1, // 1-30
      smoked_100_cigarettes: '2.0',
      smoke: '2.0',
      tobacco: '2.0',
      weight_loss: '2.0',
      freq_alcohol: Math.floor(Math.random() * 2), // 0-6 days
      freq_physical_activity: Math.floor(Math.random() * 2), // 0-6 days
      sleep_weekdays: Math.random() * 4 + 5, // 5-9 hours
      sleep_weekends: Math.random() * 4 + 5, // 5-9 hours
      weight: Math.floor(Math.random() * 50) + 50, // 50-100 kg
      height: Math.floor(Math.random() * 50) + 150 // 150-200 cm
    };

    setFormData(randomData);
    return randomData;
  };

  const handleSubmit = async (data = formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAndSubmit = () => {
    const randomData = generateRandomData();
    handleSubmit(randomData);
  };

  // Helper function to format percentile data
  const formatPercentileData = (percentiles) => {
    if (!percentiles) return null;
    
    return Object.entries(percentiles).map(([key, data]) => (
      <div key={key} className="percentile-item">
        <strong>{key}:</strong> {data.percentile !== undefined && `Percentile: ${data.percentile}%`}
        {data.percentage !== undefined && ` (Population with same value: ${data.percentage}%)`}
      </div>
    ));
  };

  return (
    <div className="test-container">
      <h1>Digital Twin Test Page</h1>
      {message && <p>Backend status: {message}</p>}
      
      <div className="controls">
        <button onClick={generateRandomData}>Generate Random Data</button>
        <button onClick={() => handleSubmit()}>Submit Current Data</button>
        <button onClick={handleGenerateAndSubmit}>Generate & Submit</button>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p className="error">Error: {error}</p>}
      
      <div className="data-display">
        <div className="form-data">
          <h3>Input Data:</h3>
          <div className="data-grid">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="data-item">
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </div>
        </div>
        
        {result && (
          <div className="results">
            <h3>Results:</h3>
            <div className="predicted-age">
              <strong>Predicted Biological Age:</strong> {result.predicted_age}
            </div>
            
            <h4>Percentile Rankings:</h4>
            <div className="percentiles">
              {formatPercentileData(result.percentiles)}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .test-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .controls {
          margin: 20px 0;
        }
        button {
          margin-right: 10px;
          padding: 8px 16px;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #357ab8;
        }
        .data-display {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .form-data, .results {
          flex: 1;
          min-width: 300px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        .data-grid, .percentiles {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }
        .data-item, .percentile-item {
          padding: 5px;
          border-bottom: 1px solid #eee;
        }
        .predicted-age {
          font-size: 1.2em;
          margin: 15px 0;
          padding: 10px;
          background-color: #e0f7fa;
          border-radius: 5px;
        }
        .error {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default Test;