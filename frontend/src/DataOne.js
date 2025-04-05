import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // make sure this is imported

function FormPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>Fill out the form</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        style={{ margin: '10px' }}
      />
      <br />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={{ margin: '10px' }}
      />
      <button onClick={() => navigate('/main')}>Go to Main Page</button>
      <button onClick={() => navigate('/results')}>Go to Results Page</button>
    </div>
    
  );
}

export default FormPage;
