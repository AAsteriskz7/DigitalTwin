import React, { useState, useEffect } from 'react';
import './DataInput.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DataThree() {
  const [form, setForm] = useState({
    highBloodPressure: '',
    highCholesterol: '',
    smoked100Cigs: '',
    currentSmoker: '',
    smokedPast5Days: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Load any saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('formDataThree');
    if (savedData) {
      setForm(JSON.parse(savedData));
    }
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save current form data to localStorage
    localStorage.setItem('formDataThree', JSON.stringify(form));
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Get data from all forms
      const formDataOne = JSON.parse(localStorage.getItem('formDataOne') || '{}');
      const formDataTwo = JSON.parse(localStorage.getItem('formDataTwo') || '{}');
      
      // Convert form values to appropriate format for the backend
      const combinedData = {
        // Basic information from form 1
        age: Number(formDataOne.age),
        Gender: formDataOne.sex == "male" ? "1" : "2",
        weight: Number(formDataOne.weight),
        height: Number(formDataOne.heightCm),
        BMI: Number(formDataOne.weight) / ((Number(formDataOne.heightCm) / 100) ** 2), // Calculate BMI
        
        // Activity data from form 2
        freq_moderate_activity: Number(formDataTwo.moderateActivity),
        freq_intense_activity: Number(formDataTwo.intenseActivity),
        mins_sedentary: Number(formDataTwo.sittingHours) * 60, // convert to minutes
        sleep_weekdays: Number(formDataTwo.sleepWeekdays),
        sleep_weekends: Number(formDataTwo.sleepWeekends),
        
        // Smoking and health data from form 3
        smoked_100_cigarettes: form.smoked100Cigs === 'Yes' ? "1.0" : "2.0",
        smoke: form.currentSmoker === 'Every day' ? "1.0" : form.currentSmoker === 'Some days' ? "2.0" : "3.0",
        tobacco: form.smokedPast5Days === 'Yes' ? "1.0" : "2.0",
        blood_pressure: form.highBloodPressure === 'Yes' ? "1.0" : "2.0", // Estimate
        cholesterol: form.highCholesterol === 'Yes' ? "1.0" : "2.0", // Estimate
        diabetes: "2.0",
      };
      
      console.log('Sending data to backend:', combinedData);
      
      // Send the data to the backend
      const response = await axios.post('http://localhost:5000/predict', combinedData);
      
      console.log('Response from backend:', response.data);
      
      // Navigate to results page with the response data
      navigate('/results', { state: { formData: combinedData, resultData: response.data } });
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

        {error && <p className="error-message">{error}</p>}
        
        <button 
          className="submit-btn" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Get Results'}
        </button>
      </form>
    </div>
  );
}

export default DataThree;