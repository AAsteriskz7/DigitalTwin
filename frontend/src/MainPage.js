import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css'; // Using your existing CSS file

function DigitalTwinPage() {
  // Ref for slideshow timer tracking
  const slideshowStartTimeRef = useRef(null);

  // State for user data based on your actual data model
  const [userData, setUserData] = useState({
    Age: 35,
    Gender: "1", // 1 for male, 2 for female
    blood_pressure: "1", // 1 = yes, 2 = no
    cholesterol: "1", // 1 = yes, 2 = no
    diabetes: "1", // 1 = yes, 2 = no
    mins_sedentary: 8, // Sitting time in hours per day
    physical_activity: 3, // Times per week
    smoked_100_cigarettes: "1", // 1 = yes, 2 = no
    smoke: "1", // 1 = every day, 2 = some days, 3 = not at all
    tobacco: "1", // 1 = yes, 2 = no
    weight_loss: "1", // 1 = yes, 2 = no
    sleep: 7.8, // Combined sleep for weekdays and weekends
    weight: 81.6, // in kilograms
    height: 70.0, // in inches
    BMI: 25.8 // calculated
  });

  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      // Get data from all forms
      const formDataOne = JSON.parse(localStorage.getItem('formDataOne') || '{}');
      const formDataTwo = JSON.parse(localStorage.getItem('formDataTwo') || '{}');
      const formDataThree = JSON.parse(localStorage.getItem('formDataThree') || '{}');
      
      // Check if we have data to work with
      if (Object.keys(formDataOne).length === 0) {
        console.log('No form data found in localStorage');
        return; // Use default values if no data exists
      }
      
      // Calculate average sleep
      const weekdaySleep = parseFloat(formDataTwo.sleepWeekdays) || 7;
      const weekendSleep = parseFloat(formDataTwo.sleepWeekends) || 8;
      const avgSleep = ((weekdaySleep * 5) + (weekendSleep * 2)) / 7;
      
      // Calculate total physical activity (combined moderate and intense)
      const moderate = parseInt(formDataTwo.moderateActivity) || 0;
      const intense = parseInt(formDataTwo.intenseActivity) || 0;
      const totalActivity = moderate + intense;
      
      // Convert height from cm to inches if provided
      const heightInInches = formDataOne.heightCm 
        ? parseFloat(formDataOne.heightCm) / 2.54 
        : 70.0;
      
      // Transform the data to match userData format
      const transformedData = {
        Age: parseInt(formDataOne.age) || 35,
        Gender: formDataOne.sex === "Male" ? "1" : "2",
        blood_pressure: formDataThree.highBloodPressure === "Yes" ? "1" : "2",
        cholesterol: formDataThree.highCholesterol === "Yes" ? "1" : "2",
        diabetes: "2", // Default to no
        mins_sedentary: parseInt(formDataTwo.sittingHours) || 8,
        physical_activity: totalActivity,
        smoked_100_cigarettes: formDataThree.smoked100Cigs === "Yes" ? "1" : "2",
        smoke: formDataThree.currentSmoker === "Every day" ? "1" : 
               formDataThree.currentSmoker === "Some days" ? "2" : "3",
        tobacco: formDataThree.smokedPast5Days === "Yes" ? "1" : "2",
        weight_loss: formDataTwo.weightLossAttempt === "Yes" ? "1" : "2",
        sleep: parseFloat(avgSleep.toFixed(1)) || 7.8,
        weight: parseFloat(formDataOne.weight) || 81.6,
        height: heightInInches,
        BMI: 0 // Will be calculated by the useEffect
      };
      
      // Update user data state
      setUserData(transformedData);
      console.log('Loaded user data from forms:', transformedData);
      
    } catch (err) {
      console.error('Error loading form data:', err);
      // Keep using default values if there's an error
    }
  }, []);

  // State for view mode and navigation
  const [yearsInFuture, setYearsInFuture] = useState(10);
  const [viewMode, setViewMode] = useState('single'); // 'single', 'all', 'slideshow'

  // State for slideshow
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [keepSameLifestyle, setKeepSameLifestyle] = useState(true);
  const [showLifestyleButtons, setShowLifestyleButtons] = useState(false);
  const [showLifestyleSliders, setShowLifestyleSliders] = useState(false);
  const [animatingProblems, setAnimatingProblems] = useState(false);

  // State for lifestyle changes in slideshow
  const [slideshowUserData, setSlideshowUserData] = useState({});

  // Health risk factors calculated based on user data and projection
  const [healthRisks, setHealthRisks] = useState({});
  const [biologicalAge, setBiologicalAge] = useState(0);

  // Calculate projected age
  const projectedAge = userData.Age + yearsInFuture;

  // Calculate BMI whenever weight or height changes
  useEffect(() => {
    // BMI formula: weight(kg) / height(m)^2
    const heightInMeters = userData.height * 0.0254; // Convert inches to meters
    const calculatedBMI = userData.weight / (heightInMeters ** 2);
    setUserData(prevData => ({
      ...prevData,
      BMI: parseFloat(calculatedBMI.toFixed(1))
    }));
  }, [userData.weight, userData.height]);

  // Generate timeframe options based on current age
  const getTimeframeOptions = () => {
    const options = [];
    const maxAge = 90;
    const currentAge = userData.Age;
    for (let i = 10; currentAge + i <= maxAge; i += 10) {
      options.push(i);
    }
    // If no options (user is 80+), add at least one option
    if (options.length === 0 && currentAge < 100) {
      options.push(Math.min(10, 100 - currentAge));
    }
    return options;
  };

  // Calculate biological age based on habits
  useEffect(() => {
    let ageDelta = 0;
    if (userData.blood_pressure === "1") ageDelta += 2;
    if (userData.cholesterol === "1") ageDelta += 2;
    if (userData.diabetes === "1") ageDelta += 3;
    if (userData.smoke === "1") ageDelta += 4;
    else if (userData.smoke === "2") ageDelta += 2;
    if (userData.physical_activity < 30) ageDelta += 2;
    else if (userData.physical_activity > 150) ageDelta -= 2;
    if (userData.mins_sedentary > 540) ageDelta += 1;
    if (userData.sleep < 6 || userData.sleep > 9) ageDelta += 1;
    if (userData.BMI < 18.5) ageDelta += 1;
    else if (userData.BMI >= 30) ageDelta += 2;
    else if (userData.BMI >= 25) ageDelta += 1;
    setBiologicalAge(projectedAge + ageDelta);
  }, [userData, projectedAge]);

  // Calculate health risks based on user data and projection year
  useEffect(() => {
    const calculateHealthRisks = () => {
      const risks = {};
      if (userData.blood_pressure === "1" || userData.cholesterol === "1" || userData.smoke === "1") {
        risks.heart = {
          risk: 'medium',
          reason: (userData.blood_pressure === "1" ? 'High blood pressure' : '') + 
                  (userData.cholesterol === "1" ? (userData.blood_pressure === "1" ? ' and high cholesterol' : 'High cholesterol') : '') +
                  (userData.smoke === "1" ? ' combined with smoking' : '') +
                  ' increases heart disease risk',
          location: 'chest'
        };
        if ((userData.blood_pressure === "1" && userData.cholesterol === "1") || 
            (userData.smoke === "1" && yearsInFuture >= 20)) {
          risks.heart.risk = 'high';
        }
      }
      if (userData.diabetes === "1" || userData.BMI > 30 || userData.mins_sedentary > 600) {
        risks.diabetes = {
          risk: 'medium',
          reason: userData.diabetes === "1" ? 'Pre-diabetic condition' : 'Lifestyle factors increase diabetes risk',
          location: 'abdomen'
        };
        if (userData.diabetes === "1" && userData.BMI > 30) {
          risks.diabetes.risk = 'high';
        }
      }
      if (userData.smoke === "1" || userData.smoke === "2" || userData.tobacco === "1") {
        risks.lungs = {
          risk: userData.smoke === "1" ? 'high' : 'medium',
          reason: 'Smoking significantly impacts lung health',
          location: 'lungs'
        };
      }
      const avgSleep = (userData.sleep * 7) / 7;
      if (avgSleep < 6 || avgSleep > 9) {
        risks.brain = {
          risk: 'low',
          reason: 'Sleep quality impacts cognitive health',
          location: 'head'
        };
        if (yearsInFuture >= 30 && avgSleep < 5) {
          risks.brain.risk = 'medium';
        }
      }
      if (userData.BMI > 30 || userData.physical_activity < 10) {
        risks.joints = {
          risk: 'medium',
          reason: userData.BMI > 30 ? 'Excess weight puts strain on joints' : 'Low activity increases joint problems',
          location: 'knees'
        };
        if (userData.BMI > 35 && yearsInFuture >= 20) {
          risks.joints.risk = 'high';
        }
      }
      return risks;
    };
    setHealthRisks(calculateHealthRisks());
  }, [userData, yearsInFuture]);

  // Calculate health risks for slideshow
  useEffect(() => {
    if (!slideshowActive) return;
    const calculateSlideshowHealthRisks = () => {
      const risks = {};
      const dataToUse = userData; // Always use the current slider values from the main page
      const slideshowYearsInFuture = getTimeframeOptions()[currentYearIndex] || yearsInFuture;
      if (dataToUse.blood_pressure === "1" || dataToUse.cholesterol === "1" || dataToUse.smoke === "1") {
        risks.heart = {
          risk: 'medium',
          reason: (dataToUse.blood_pressure === "1" ? 'High blood pressure' : '') + 
                  (dataToUse.cholesterol === "1" ? (dataToUse.blood_pressure === "1" ? ' and high cholesterol' : 'High cholesterol') : '') +
                  (dataToUse.smoke === "1" ? ' combined with smoking' : '') +
                  ' increases heart disease risk',
          location: 'chest'
        };
        if ((dataToUse.blood_pressure === "1" && dataToUse.cholesterol === "1") || 
            (dataToUse.smoke === "1" && slideshowYearsInFuture >= 20)) {
          risks.heart.risk = 'high';
        }
      }
      if (dataToUse.diabetes === "1" || dataToUse.BMI > 30 || dataToUse.mins_sedentary > 600) {
        risks.diabetes = {
          risk: 'medium',
          reason: dataToUse.diabetes === "1" ? 'Pre-diabetic condition' : 'Lifestyle factors increase diabetes risk',
          location: 'abdomen'
        };
        if (dataToUse.diabetes === "1" && dataToUse.BMI > 30) {
          risks.diabetes.risk = 'high';
        }
      }
      if (dataToUse.smoke === "1" || dataToUse.smoke === "2" || dataToUse.tobacco === "1") {
        risks.lungs = {
          risk: dataToUse.smoke === "1" ? 'high' : 'medium',
          reason: 'Smoking significantly impacts lung health',
          location: 'lungs'
        };
      }
      const avgSleep = (dataToUse.sleep * 7) / 7;
      if (avgSleep < 6 || avgSleep > 9) {
        risks.brain = {
          risk: 'low',
          reason: 'Sleep quality impacts cognitive health',
          location: 'head'
        };
        if (slideshowYearsInFuture >= 30 && avgSleep < 5) {
          risks.brain.risk = 'medium';
        }
      }
      if (dataToUse.BMI > 30 || dataToUse.physical_activity < 10) {
        risks.joints = {
          risk: 'medium',
          reason: dataToUse.BMI > 30 ? 'Excess weight puts strain on joints' : 'Low activity increases joint problems',
          location: 'knees'
        };
        if (dataToUse.BMI > 35 && slideshowYearsInFuture >= 20) {
          risks.joints.risk = 'high';
        }
      }
      return risks;
    };
    if (slideshowActive) {
      setHealthRisks(calculateSlideshowHealthRisks());
    }
  }, [
    slideshowActive,
    showLifestyleSliders,
    currentYearIndex,
    keepSameLifestyle,
    userData,
    slideshowUserData,
    yearsInFuture
  ]);

  // Handle slider changes
  const handleSliderChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  // Handle slider changes in slideshow
  const handleSlideshowSliderChange = (field, value) => {
    setSlideshowUserData({
      ...slideshowUserData,
      [field]: value
    });
  };

  // Toggle between single projection and multiple futures
  const toggleViewMode = () => {
    setViewMode(viewMode === 'single' ? 'all' : 'single');
  };

  // Start the lifestyle preview directly
  const startFuturePreview = () => {
    // Use current slider values directly
    setSlideshowUserData({ ...userData });
    setCurrentYearIndex(0);
    setAnimatingProblems(true);
    setSlideshowActive(true);
    slideshowStartTimeRef.current = Date.now();
    document.body.classList.add('slideshow-fullscreen-active');
  };

  // Start slideshow after adjusting lifestyle
  const startSlideshowAfterChanges = () => {
    setShowLifestyleSliders(false);
    setSlideshowActive(true);
    setCurrentYearIndex(0);
    setAnimatingProblems(true);
  };

  // Stop slideshow
  const stopSlideshow = () => {
    setSlideshowActive(false);
    document.body.classList.remove('slideshow-fullscreen-active');
  };

  // Navigate to next slide
  const goToNextSlide = () => {
    const yearOptions = getTimeframeOptions();
    if (currentYearIndex < yearOptions.length - 1) {
      // Reset animation state to trigger animations again
      setAnimatingProblems(false);
      setTimeout(() => {
        setCurrentYearIndex(prev => prev + 1);
        setAnimatingProblems(true);
      }, 50); // Small delay to ensure state changes properly
    } else {
      setCurrentYearIndex(yearOptions.length);
    }
  };

  return (
    <div className="digital-twin-container">
      <div className="digital-twin-header">
        <h1>Your Digital Twin</h1>
        <p>See how your habits today shape your future health</p>
      </div>

      {/* Future Timeframe Selection */}
      <div className="time-selector">
        <h2>See Your Future Self</h2>
        {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && !showLifestyleSliders && (
          <div className="single-future-view">
            <button
              className="view-toggle-button slideshow-button"
              onClick={startFuturePreview}
            >
              Show me a preview of my life
            </button>
            <div className="year-selector">
              <span>In</span>
              <select
                value={yearsInFuture}
                onChange={(e) => setYearsInFuture(Number(e.target.value))}
              >
                {getTimeframeOptions().map(years => (
                  <option key={years} value={years}>
                    {years} years
                  </option>
                ))}
              </select>
              <span>You at age {projectedAge}</span>
            </div>
          </div>
        )}
        {viewMode === 'all' && (
          <div className="all-futures-view">
            <button className="view-toggle-button" onClick={toggleViewMode}>
              Show Single Projection
            </button>
            <div className="futures-grid">
              {getTimeframeOptions().map(years => (
                <div key={years} className="future-card">
                  <h3>In {years} years</h3>
                  <p>You at age {userData.Age + years}</p>
                  <div className="mini-avatar">
                    <div className="avatar-placeholder"></div>
                    <p>
                      {Object.keys(healthRisks).length > 0
                        ? `${Object.keys(healthRisks).length} potential health concerns`
                        : 'No major health concerns'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Removed the lifestyle selection modals */}

      {/* Fullscreen Slideshow */}
      {slideshowActive && (
        <div className="slideshow-fullscreen">
          <div className="slideshow-container">
            <div className="slideshow-centered-content">
              <div className="slideshow-header">
                <div className="slideshow-title">
                  <h3>Your Future Timeline</h3>
                  <span className="lifestyle-label">
                    Based on Your Current Habits
                  </span>
                </div>
                <button className="exit-button" onClick={stopSlideshow}>
                  ×
                </button>
              </div>
              
              <div className="slideshow-content">
                {currentYearIndex < getTimeframeOptions().length ? (
                  <div className="slideshow-slide">
                    <div className="slideshow-info">
                      <h4>In {getTimeframeOptions()[currentYearIndex]} years</h4>
                      <p>You at age {userData.Age + getTimeframeOptions()[currentYearIndex]}</p>
                      
                      <div className="slideshow-age-card">
                        <div className="age-comparison">
                          <div className="age-item">
                            <span className="age-label">Chronological Age</span>
                            <span className="age-value">
                              {userData.Age + getTimeframeOptions()[currentYearIndex]}
                            </span>
                          </div>
                          <div className="age-item">
                            <span className="age-label">Biological Age</span>
                            <span className="age-value">
                              {Math.round(
                                userData.Age +
                                  getTimeframeOptions()[currentYearIndex] +
                                  (getTimeframeOptions()[currentYearIndex] > 20 ? 8 : 4)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="slideshow-avatar-container">
                      <img
                        src="/avatar-image.png"
                        alt="Digital Twin Avatar"
                        className="avatar-image"
                      />
                      {Object.entries(healthRisks)
                        .sort((a, b) => {
                          const locationOrder = { head: 1, lungs: 2, chest: 3, abdomen: 4, knees: 5 };
                          return locationOrder[a[1].location] - locationOrder[b[1].location];
                        })
                        .map(([riskKey, risk], index) => {
                          const isLeft = index % 2 === 0;
                          return (
                            <div
                              key={riskKey}
                              className={`slideshow-problem ${animatingProblems ? 'animate' : ''} ${
                                isLeft ? 'problem-left' : 'problem-right'
                              }`}
                              style={{
                                animationDelay: `${index * 1.2}s`,
                                left: isLeft ? '-80px' : 'auto',  // Move text farther left
                                right: !isLeft ? '-80px' : 'auto', // Move text farther right
                                top:
                                  risk.location === 'head'
                                    ? '10%'
                                    : risk.location === 'lungs'
                                    ? '30%'
                                    : risk.location === 'chest'
                                    ? '38%'
                                    : risk.location === 'abdomen'
                                    ? '55%'
                                    : '75%',
                                marginTop: index > 0 ? `${(index % 3) * 50}px` : '0'  // Increased vertical spacing
                              }}
                            >
                              {isLeft ? (
                                <>
                                  <div className="problem-info problem-info-left">
                                    <span className="problem-title">
                                      {riskKey === 'heart'
                                        ? 'Heart Health'
                                        : riskKey === 'lungs'
                                        ? 'Lung Health'
                                        : riskKey === 'brain'
                                        ? 'Brain Health'
                                        : riskKey === 'diabetes'
                                        ? 'Metabolic Health'
                                        : 'Joint Health'}
                                    </span>
                                    <p className="problem-description">{risk.reason}</p>
                                  </div>
                                </>
                              ) : (
                                <div className="problem-info problem-info-right">
                                  <span className="problem-title">
                                    {riskKey === 'heart'
                                      ? 'Heart Health'
                                      : riskKey === 'lungs'
                                      ? 'Lung Health'
                                      : riskKey === 'brain'
                                      ? 'Brain Health'
                                      : riskKey === 'diabetes'
                                      ? 'Metabolic Health'
                                      : 'Joint Health'}
                                  </span>
                                  <p className="problem-description">{risk.reason}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    
                    <div className="slideshow-progress">
                      {getTimeframeOptions().map((years, index) => (
                        <div
                          key={years}
                          className={`progress-dot ${index === currentYearIndex ? 'active' : ''} ${
                            index < currentYearIndex ? 'completed' : ''
                          }`}
                        >
                          <span className="progress-year">+{years}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="primary-button next-button" onClick={goToNextSlide}>
                      Next
                    </button>
                  </div>
                ) : (
                  <div className="final-slide">
                    <h3>Take Action Before It's Too Late</h3>
                    <div className="final-message">
                      <p>Your daily habits today shape your health tomorrow.</p>
                      <p>Small changes can have a big impact on your future wellbeing.</p>
                      <p>The best time to start is now.</p>
                    </div>
                    <button className="primary-button start-again-button" onClick={stopSlideshow}>
                      Back to Digital Twin
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Avatar and Sliders */}
      {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && !showLifestyleSliders && (
        <div className="future-self-container">
          <div className="avatar-section">
            <h3>Your Body at Age {projectedAge}</h3>
            <div className="avatar-container">
              <div className="custom-avatar">
                <img src="/avatar-image.png" alt="Digital Twin Avatar" className="avatar-image" />
                
                {/* Blood Pressure Indicator */}
                <div className="risk-indicator heart-indicator risk-high" style={{top: "150px", left: "205px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Heart Health</span>
                    <p>Blood pressure status: {userData.blood_pressure === "1" ? "High" : "Normal"}</p>
                  </div>
                </div>
                
                {/* Sleep Indicator */}
                <div className="risk-indicator sleep-indicator risk-medium" style={{top: "50px", left: "200px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Sleep Health</span>
                    <p>Sleep duration: {userData.sleep} hours/day</p>
                  </div>
                </div>
                
                {/* Physical Activity Indicator */}
                <div className="risk-indicator fitness-indicator risk-medium" style={{top: "365px", left: "190px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Physical Fitness</span>
                    <p>Activity level: {userData.physical_activity} times/week</p>
                  </div>
                </div>
                
                {/* Sitting Time Indicator */}
                <div className="risk-indicator metabolic-indicator risk-high" style={{top: "220px", left: "195px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Metabolic Health</span>
                    <p>Daily sitting time: {userData.mins_sedentary} hours</p>
                  </div>
                </div>
                
                {/* Smoking Indicator */}
                <div className="risk-indicator lungs-indicator risk-high" style={{top: "160px", left: "170px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Lung Health</span>
                    <p>Smoking status: {userData.smoke === "1" ? "Daily smoker" : userData.smoke === "2" ? "Occasional smoker" : "Non-smoker"}</p>
                  </div>
                </div>
                
                {/* Weight/BMI Indicator */}
                <div className="risk-indicator cholesterol-indicator risk-medium" style={{top: "190px", left: "250px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Cardiovascular Health</span>
                    <p>Weight: {userData.weight} kg (BMI: {userData.BMI.toFixed(1)})</p>
                  </div>
                </div>
              </div>
            </div>
            {Object.keys(healthRisks).length === 0 && (
              <div className="no-risks-message">
                <p>No major health concerns detected for age {projectedAge}</p>
              </div>
            )}
            <div className="biological-age-card">
              <h4>Biological Age Estimate</h4>
              <div className="age-comparison">
                <div className="age-item">
                  <span className="age-label">Chronological Age</span>
                  <span className="age-value">{projectedAge}</span>
                </div>
                <div className="age-item">
                  <span className="age-label">Biological Age</span>
                  <span className="age-value">{Math.round(biologicalAge)}</span>
                </div>
              </div>
              <div className="bmi-display">
                <span className="bmi-label">BMI</span>
                <span className="bmi-value">{userData.BMI.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="habits-section">
            <h3>Adjust Your Habits</h3>
            <p className="section-description">
              See how lifestyle changes could affect your future health.
            </p>
            <div className="sliders-container">
              <div className="slider-item">
                <label>
                  Blood Pressure Status: <span className="slider-value">{userData.blood_pressure === "1" ? "High" : "Normal"}</span>
                </label>
                <div className="button-group">
                  <button
                    className={userData.blood_pressure === "1" ? 'active' : ''}
                    onClick={() => handleSliderChange('blood_pressure', "1")}
                  >
                    High
                  </button>
                  <button
                    className={userData.blood_pressure === "2" ? 'active' : ''}
                    onClick={() => handleSliderChange('blood_pressure', "2")}
                  >
                    Normal
                  </button>
                </div>
              </div>
              
              <div className="slider-item">
                <label>
                  Sleep (hours/day): <span className="slider-value">{userData.sleep}</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={userData.sleep}
                  onChange={(e) => handleSliderChange('sleep', parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>4h</span>
                  <span>8h</span>
                  <span>12h</span>
                </div>
              </div>
              
              <div className="slider-item">
                <label>
                  Physical Activity (times/week): <span className="slider-value">{userData.physical_activity}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="7"
                  step="1"
                  value={userData.physical_activity}
                  onChange={(e) => handleSliderChange('physical_activity', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0</span>
                  <span>3</span>
                  <span>7</span>
                </div>
              </div>
              <div className="slider-item">
                <label>
                  Daily Sitting Time (hours): <span className="slider-value">{userData.mins_sedentary}</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={userData.mins_sedentary}
                  onChange={(e) => handleSliderChange('mins_sedentary', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>2h</span>
                  <span>8h</span>
                  <span>16h</span>
                </div>
              </div>
              <div className="button-group-item">
                <label>Smoking Status:</label>
                <div className="button-group">
                  <button
                    className={userData.smoke === "1" ? 'active' : ''}
                    onClick={() => handleSliderChange('smoke', "1")}
                  >
                    Every day
                  </button>
                  <button
                    className={userData.smoke === "2" ? 'active' : ''}
                    onClick={() => handleSliderChange('smoke', "2")}
                  >
                    Some days
                  </button>
                  <button
                    className={userData.smoke === "3" ? 'active' : ''}
                    onClick={() => handleSliderChange('smoke', "3")}
                  >
                    Not at all
                  </button>
                </div>
              </div>
              <div className="slider-item">
                <label>
                  Weight (kg): <span className="slider-value">{userData.weight}</span>
                </label>
                <input
                  type="range"
                  min="45"
                  max="150"
                  step="1"
                  value={userData.weight}
                  onChange={(e) => handleSliderChange('weight', parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>20 kg</span>
                  <span>115 kg</span>
                  <span>250 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DigitalTwinPage;