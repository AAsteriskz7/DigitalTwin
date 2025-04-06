import React, { useState, useEffect } from 'react';
import './DataInput.css';
import { useNavigate } from 'react-router-dom';

function DataTwo() {
  const [form, setForm] = useState({
    moderateActivity: '',
    intenseActivity: '',
    sittingHours: '',
    weightLossAttempt: '',
    sleepWeekdays: '',
    sleepWeekends: '',
  });

  const navigate = useNavigate();

  // Load any saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('formDataTwo');
    if (savedData) {
      setForm(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save to localStorage before navigating
    localStorage.setItem('formDataTwo', JSON.stringify(form));
    
    console.log(form);
    navigate('/datathree'); // Navigate to the next page
  };

  // Utility function to create number options
  const renderOptions = (max) =>
    [...Array(max + 1)].map((_, i) => (
      <option key={i} value={i}>{i}</option>
    ));

  return (
    <div className="data-form-page">
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>
      <div className="blur blur3"></div>

      <h1 className="form-title">Lifestyle Questions</h1>
      <form className="form-container" onSubmit={handleSubmit}>

        {/* Physical Activity */}
        <h3 className="form-section-title">🏃 Physical Activity</h3>
        <label>Moderate-intensity activity (times/week)</label>
        <select name="moderateActivity" value={form.moderateActivity} onChange={handleChange}>
          <option value="">Select</option>
          {renderOptions(14)}
        </select>

        <label>Intense activity (times/week)</label>
        <select name="intenseActivity" value={form.intenseActivity} onChange={handleChange}>
          <option value="">Select</option>
          {renderOptions(14)}
        </select>

        <label>Sitting time per day (hours)</label>
        <select name="sittingHours" value={form.sittingHours} onChange={handleChange}>
          <option value="">Select</option>
          {renderOptions(16)}
        </select>

        {/* Weight Goals */}
        <h3 className="form-section-title">⚖️ Weight Goals</h3>
        <label>Have you tried to lose weight in the past year?</label>
        <select
          name="weightLossAttempt"
          value={form.weightLossAttempt}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        {/* Sleep */}
        <h3 className="form-section-title">🛌 Sleep</h3>
        <label>Sleep hours on weekdays</label>
        <select name="sleepWeekdays" value={form.sleepWeekdays} onChange={handleChange}>
          <option value="">Select</option>
          {renderOptions(12)}
        </select>

        <label>Sleep hours on weekends</label>
        <select name="sleepWeekends" value={form.sleepWeekends} onChange={handleChange}>
          <option value="">Select</option>
          {renderOptions(12)}
        </select>

        <button className="submit-btn" type="submit">Continue</button>
      </form>
    </div>
  );
}

export default DataTwo;