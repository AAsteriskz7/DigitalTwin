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
    mins_sedentary: 480,
    physical_activity: 45, // Combined moderate and intense activity
    smoked_100_cigarettes: "1", // 1 = yes, 2 = no
    smoke: "1", // 1 = every day, 2 = some days, 3 = not at all
    tobacco: "1", // 1 = yes, 2 = no
    weight_loss: "1", // 1 = yes, 2 = no
    sleep: 7.8, // Combined sleep for weekdays and weekends
    weight: 180.0, // in pounds
    height: 70.0, // in inches
    BMI: 25.8 // calculated
  });

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
    // BMI formula: 703 * weight(lb) / height(in)^2
    const calculatedBMI = (703 * userData.weight) / (userData.height ** 2);
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
                {healthRisks.heart && (
                  <div className="risk-indicator heart-indicator">
                    <div className="risk-tooltip">
                      <span className="risk-title">Heart Health</span>
                      <p>{healthRisks.heart.reason}</p>
                    </div>
                  </div>
                )}
                {healthRisks.lungs && (
                  <div className="risk-indicator lungs-indicator">
                    <div className="risk-tooltip">
                      <span className="risk-title">Lung Health</span>
                      <p>{healthRisks.lungs.reason}</p>
                    </div>
                  </div>
                )}
                {healthRisks.brain && (
                  <div className="risk-indicator brain-indicator">
                    <div className="risk-tooltip">
                      <span className="risk-title">Brain Health</span>
                      <p>{healthRisks.brain.reason}</p>
                    </div>
                  </div>
                )}
                {healthRisks.diabetes && (
                  <div className="risk-indicator diabetes-indicator">
                    <div className="risk-tooltip">
                      <span className="risk-title">Metabolic Health</span>
                      <p>{healthRisks.diabetes.reason}</p>
                    </div>
                  </div>
                )}
                {healthRisks.joints && (
                  <div className="risk-indicator joints-indicator">
                    <div className="risk-tooltip">
                      <span className="risk-title">Joint Health</span>
                      <p>{healthRisks.joints.reason}</p>
                    </div>
                  </div>
                )}
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
                  Physical Activity (min/week): <span className="slider-value">{userData.physical_activity}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={userData.physical_activity}
                  onChange={(e) => handleSliderChange('physical_activity', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0 min</span>
                  <span>150 min</span>
                  <span>300 min</span>
                </div>
              </div>
              <div className="slider-item">
                <label>
                  Daily Sedentary Time (min): <span className="slider-value">{userData.mins_sedentary}</span>
                </label>
                <input
                  type="range"
                  min="120"
                  max="960"
                  step="30"
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
                  Weight (lbs): <span className="slider-value">{userData.weight}</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="5"
                  value={userData.weight}
                  onChange={(e) => handleSliderChange('weight', parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>100 lbs</span>
                  <span>200 lbs</span>
                  <span>300 lbs</span>
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