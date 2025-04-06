import React, { useState } from 'react';
import './DataInput.css';
import { useNavigate } from 'react-router-dom';



function DataOne() {
  const [form, setForm] = useState({
    name: '',
    age: '',
    weight: '',
    heightFeet: '',
    heightInch: '',
    sex: '',
  });

  const navigate = useNavigate();


  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form); // you can send this to backend or navigate
  };

  return (
    <div className="data-form-page">
      <div className="blur blur1"></div>
<div className="blur blur2"></div>
<div className="blur blur3"></div>

      <h1 className="form-title">Your Information</h1>
      <form className="form-container" onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
        <input name="weight" type="number" placeholder="Weight (lbs)" value={form.weight} onChange={handleChange} />

        <div className="height-group">
          <input name="heightFeet" type="number" placeholder="Height (ft)" value={form.heightFeet} onChange={handleChange} />
          <input name="heightInch" type="number" placeholder="Height (in)" value={form.heightInch} onChange={handleChange} />
        </div>

        <select name="sex" value={form.sex} onChange={handleChange}>
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <button className="submit-btn" type="submit">Continue</button>
      </form>
      <button className="mainpage-btn" onClick={() => navigate('/main')}>Main Page</button>
      <button className="results-btn" onClick={() => navigate('/results')}>Result Page</button>
    </div>

  );
}

export default DataOne;
