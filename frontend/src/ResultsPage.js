import React from 'react';
import { useNavigate } from 'react-router-dom';

function ResultsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Results Page</h2>
      
      <div style={{ margin: '20px' }}>
        <p>Here are your results:</p>
        {/* Placeholder for actual results data */}
        <div style={{ border: '1px solid #ccc', padding: '15px', margin: '20px auto', maxWidth: '500px' }}>
          <p>Form submission successful!</p>
          <p>Thank you for your information.</p>
        </div>
      </div>
      
      <button onClick={() => navigate('/main')}>Go to Main Page</button>
      <button onClick={() => navigate('/form')}>Back to Form</button>
    </div>
  );
}

export default ResultsPage;