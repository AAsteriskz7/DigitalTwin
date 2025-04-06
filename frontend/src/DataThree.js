import React, { useState } from 'react';
import './DataInput.css'; // Add styles here
import { useNavigate } from 'react-router-dom';

function DataThree() {
  const [form, setForm] = useState({
    highBloodPressure: '',
    highCholesterol: '',
    smoked100Cigs: '',
    currentSmoker: '',
    smokedPast5Days: '',
  });

  const navigate = useNavigate();

  const handleChoice = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    navigate('/main');
  };

  const renderYesNo = (label, name) => (
    <div className="question-block">
      <label>{label}</label>
      <div className="yes-no-buttons">
        <button
          type="button"
          className={form[name] === 'No' ? 'yn-button active' : 'yn-button'}
          onClick={() => handleChoice(name, 'No')}
        >
          NO
        </button>
        <button
          type="button"
          className={form[name] === 'Yes' ? 'yn-button active' : 'yn-button'}
          onClick={() => handleChoice(name, 'Yes')}
        >
          Yes
        </button>
      </div>
    </div>
  );

  return (
    <div className="data-form-page">
      <div className="blur blur1"></div>
      <div className="blur blur2"></div>
      <div className="blur blur3"></div>

      <h1 className="form-title">Medical History & Smoking</h1>
      <form className="form-container" onSubmit={handleSubmit}>

        {renderYesNo("Have you ever been told you have high blood pressure?", "highBloodPressure")}
        {renderYesNo("Have you ever been told you have high cholesterol?", "highCholesterol")}
        {renderYesNo("Have you smoked 100 cigarettes in your lifetime?", "smoked100Cigs")}

        <label>Do you smoke cigarettes?</label>
        <select name="currentSmoker" value={form.currentSmoker} onChange={handleChange}>
          <option value="">Select</option>
          <option value="Every day">Every day</option>
          <option value="Some days">Some days</option>
          <option value="Not at all">Not at all</option>
        </select>

        {renderYesNo("During the past 5 days, have you smoked tobacco?", "smokedPast5Days")}

        <button className="submit-btn" type="submit">Continue</button>
      </form>
    </div>
  );
}

export default DataThree;