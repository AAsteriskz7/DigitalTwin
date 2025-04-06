import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css'; // Assuming you'll have a styles file

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
    freq_moderate_activity: 30,
    freq_intense_activity: 15,
    smoked_100_cigarettes: "1", // 1 = yes, 2 = no
    smoke: "1", // 1 = every day, 2 = some days, 3 = not at all
    tobacco: "1", // 1 = yes, 2 = no
    weight_loss: "1", // 1 = yes, 2 = no
    freq_alcohol: 2, // days per week
    sleep_weekdays: 7.5,
    sleep_weekends: 8.0,
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
  const [animatingProblems, setAnimatingProblems] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [remainingTime, setRemainingTime] = useState(10);
  
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
    let maxAge = 90;
    let currentAge = userData.Age;
    
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
    // Simple estimation formula based on risk factors
    // In a real app, this would use your ML model
    let ageDelta = 0;
    
    // Blood pressure impact
    if (userData.blood_pressure === "1") ageDelta += 2;
    
    // Cholesterol impact
    if (userData.cholesterol === "1") ageDelta += 2;
    
    // Diabetes impact
    if (userData.diabetes === "1") ageDelta += 3;
    
    // Smoking impact
    if (userData.smoke === "1") ageDelta += 4;
    else if (userData.smoke === "2") ageDelta += 2;
    
    // Physical activity impact (inverse relationship)
    const activitySum = userData.freq_moderate_activity + userData.freq_intense_activity;
    if (activitySum < 30) ageDelta += 2;
    else if (activitySum > 150) ageDelta -= 2;
    
    // Sedentary time impact
    if (userData.mins_sedentary > 540) ageDelta += 1;
    
    // Sleep impact (U-shaped relationship)
    const avgSleep = (userData.sleep_weekdays * 5 + userData.sleep_weekends * 2) / 7;
    if (avgSleep < 6 || avgSleep > 9) ageDelta += 1;
    
    // BMI impact (U-shaped relationship)
    if (userData.BMI < 18.5) ageDelta += 1;
    else if (userData.BMI >= 30) ageDelta += 2;
    else if (userData.BMI >= 25) ageDelta += 1;
    
    // Alcohol impact
    if (userData.freq_alcohol > 7) ageDelta += 2;
    else if (userData.freq_alcohol > 14) ageDelta += 4;
    
    setBiologicalAge(projectedAge + ageDelta);
    
  }, [userData, projectedAge]);

  // Calculate health risks based on user data and projection year
  useEffect(() => {
    const calculateHealthRisks = () => {
      const risks = {};
      
      // Heart disease risk factors
      if (userData.blood_pressure === "1" || userData.cholesterol === "1" || userData.smoke === "1") {
        risks.heart = {
          risk: 'medium',
          reason: (userData.blood_pressure === "1" ? 'High blood pressure' : '') + 
                  (userData.cholesterol === "1" ? (userData.blood_pressure === "1" ? ' and high cholesterol' : 'High cholesterol') : '') +
                  (userData.smoke === "1" ? ' combined with smoking' : '') + 
                  ' increases heart disease risk',
          location: 'chest'
        };
        
        // Higher risk with multiple factors or longer timeframe
        if ((userData.blood_pressure === "1" && userData.cholesterol === "1") || 
            (userData.smoke === "1" && yearsInFuture >= 20)) {
          risks.heart.risk = 'high';
        }
      }
      
      // Diabetes risk factors
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
      
      // Lung health risk factors
      if (userData.smoke === "1" || userData.smoke === "2" || userData.tobacco === "1") {
        risks.lungs = {
          risk: userData.smoke === "1" ? 'high' : 'medium',
          reason: 'Smoking significantly impacts lung health',
          location: 'lungs'
        };
      }
      
      // Brain health risk factors
      const avgSleep = (userData.sleep_weekdays * 5 + userData.sleep_weekends * 2) / 7;
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
      
      // Joint health risks (based on BMI and activity)
      if (userData.BMI > 30 || userData.freq_moderate_activity < 10) {
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

  // Handle slider changes
  const handleSliderChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };
  
  // Toggle between single projection and multiple futures
  const toggleViewMode = () => {
    setViewMode(viewMode === 'single' ? 'all' : 'single');
  };
  
  // Start the lifestyle selection process
  const startFuturePreview = () => {
    setShowLifestyleButtons(true);
  };
  
  // Start slideshow with selected lifestyle option
  const startSlideshow = (keepCurrent) => {
    setKeepSameLifestyle(keepCurrent);
    setShowLifestyleButtons(false);
    setSlideshowActive(true);
    setCurrentYearIndex(0);
    setAnimatingProblems(true);
    setAnimationComplete(false);
    slideshowStartTimeRef.current = Date.now();
    setRemainingTime(10);
    // Add fullscreen class to body
    document.body.classList.add('slideshow-fullscreen-active');
  };
  
  // Stop slideshow
  const stopSlideshow = () => {
    setSlideshowActive(false);
    setShowLifestyleButtons(false);
    // Remove fullscreen class from body
    document.body.classList.remove('slideshow-fullscreen-active');
  };
  
  // Countdown timer effect
  useEffect(() => {
    let timerInterval;
    
    if (slideshowActive && animationComplete) {
      timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - slideshowStartTimeRef.current) / 1000);
        const remaining = Math.max(0, 10 - elapsed);
        setRemainingTime(remaining);
        
        if (remaining === 0) {
          clearInterval(timerInterval);
        }
      }, 1000);
    }
    
    return () => {
      clearInterval(timerInterval);
    };
  }, [slideshowActive, animationComplete]);
  
  // Handle slideshow auto-advancement
  useEffect(() => {
    let slideTimer;
    let animationTimer;
    
    if (slideshowActive) {
      // Reset timer reference
      slideshowStartTimeRef.current = Date.now();
      
      // Set animation flag at the start of each slide
      setAnimatingProblems(true);
      setAnimationComplete(false);
      
      // Wait for animation to complete (problems appearing takes around 4 seconds)
      animationTimer = setTimeout(() => {
        setAnimationComplete(true);
      }, 4000);
      
      // Advance to next slide after 10 seconds
      slideTimer = setTimeout(() => {
        const yearOptions = getTimeframeOptions();
        
        if (currentYearIndex < yearOptions.length - 1) {
          setCurrentYearIndex(prev => prev + 1);
        } else {
          // Show one more slide with final message
          setCurrentYearIndex(yearOptions.length);
        }
      }, 10000);
    }
    
    return () => {
      clearTimeout(slideTimer);
      clearTimeout(animationTimer);
    };
  }, [slideshowActive, currentYearIndex]);

  return (
    <div className="digital-twin-container">
      <div className="digital-twin-header">
        <h1>Your Digital Twin</h1>
        <p>See how your habits today shape your future health</p>
      </div>
      
      {/* Future Timeframe Selection */}
      <div className="time-selector">
        <h2>See Your Future Self</h2>
        
        {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && (
          <div className="single-future-view">
            <button 
              className="view-toggle-button slideshow-button" 
              onClick={startFuturePreview}
            >
              Preview My Future
            </button>
            <div className="year-selector">
              <span>In</span>
              <select 
                value={yearsInFuture} 
                onChange={(e) => setYearsInFuture(Number(e.target.value))}
              >
                {getTimeframeOptions().map(years => (
                  <option key={years} value={years}>{years} years</option>
                ))}
              </select>
              <span>You at age {projectedAge}</span>
            </div>
          </div>
        )}
        
        {viewMode === 'all' && (
          <div className="all-futures-view">
            <button 
              className="view-toggle-button"
              onClick={toggleViewMode}
            >
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
                      {Object.keys(healthRisks).length > 0 ? 
                        `${Object.keys(healthRisks).length} potential health concerns` : 
                        'No major health concerns'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Lifestyle Selection Modal */}
      {showLifestyleButtons && (
        <div className="lifestyle-selection">
          <h3>How would you like to see your future?</h3>
          <p>Choose an option to start the slideshow</p>
          <div className="lifestyle-buttons">
            <button 
              className="primary-button lifestyle-choice" 
              onClick={() => startSlideshow(true)}
            >
              Keep Current Lifestyle
            </button>
            <button 
              className="secondary-button lifestyle-choice" 
              onClick={() => startSlideshow(false)}
            >
              Change My Lifestyle
            </button>
          </div>
          <button 
            className="cancel-button" 
            onClick={() => setShowLifestyleButtons(false)}
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Fullscreen Slideshow */}
      {slideshowActive && (
        <div className="slideshow-fullscreen">
          <div className="slideshow-container">
            <div className="slideshow-header">
              <div className="slideshow-title">
                <h3>Your Future Timeline</h3>
                <span className="lifestyle-label">
                  {keepSameLifestyle ? 'Current Lifestyle' : 'Optimized Lifestyle'}
                </span>
              </div>
              <button 
                className="exit-button" 
                onClick={stopSlideshow}
              >
                Exit Preview
              </button>
            </div>
            
            <div className="slideshow-content">
              <div className="slideshow-progress">
                {getTimeframeOptions().map((years, index) => (
                  <div 
                    key={years} 
                    className={`progress-dot ${index === currentYearIndex ? 'active' : ''} ${index < currentYearIndex ? 'completed' : ''}`}
                  >
                    <span className="progress-year">+{years}</span>
                  </div>
                ))}
              </div>
              
              {currentYearIndex < getTimeframeOptions().length ? (
                <>
                  <div className="timeline-indicator">
                    {animationComplete && (
                      <div className="next-slide-indicator">
                        Next slide in {remainingTime} seconds
                      </div>
                    )}
                  </div>
                  
                  <div className="slideshow-slide">
                    <h4>In {getTimeframeOptions()[currentYearIndex]} years</h4>
                    <p>You at age {userData.Age + getTimeframeOptions()[currentYearIndex]}</p>
                    
                    <div className="slideshow-avatar-container">
                      <img src="/avatar-image.png" alt="Digital Twin Avatar" className="avatar-image" />
                      
                      {/* Health problems that animate in sequence from top to bottom */}
                      {Object.entries(healthRisks)
                        .sort((a, b) => {
                          // Sort by body location from top to bottom
                          const locationOrder = {
                            'head': 1,
                            'lungs': 2,
                            'chest': 3,
                            'abdomen': 4,
                            'knees': 5
                          };
                          return locationOrder[a[1].location] - locationOrder[b[1].location];
                        })
                        .map(([riskKey, risk], index) => {
                          // Calculate risk severity based on time and lifestyle
                          let adjustedRisk = risk.risk;
                          const yearProjection = getTimeframeOptions()[currentYearIndex];
                          
                          if (keepSameLifestyle) {
                            // Risk worsens over time with current lifestyle
                            if (yearProjection >= 30 && risk.risk !== 'high') {
                              adjustedRisk = 'high';
                            } else if (yearProjection >= 20 && risk.risk === 'low') {
                              adjustedRisk = 'medium';
                            }
                          } else {
                            // Risk improves with optimized lifestyle
                            if (yearProjection <= 10 && risk.risk === 'high') {
                              adjustedRisk = 'medium';
                            } else if (risk.risk === 'medium') {
                              adjustedRisk = 'low';
                            }
                          }
                          
                          return (
                            <div 
                              key={riskKey}
                              className={`slideshow-problem ${animatingProblems ? 'animate' : ''}`} 
                              style={{ 
                                animationDelay: `${index * 0.8}s`,
                                left: index % 2 === 0 ? '0' : 'auto',
                                right: index % 2 === 1 ? '0' : 'auto',
                                top: risk.location === 'head' ? '10%' : 
                                     risk.location === 'lungs' ? '30%' : 
                                     risk.location === 'chest' ? '35%' : 
                                     risk.location === 'abdomen' ? '50%' : '75%'
                              }}
                            >
                              <div className={`problem-indicator risk-${adjustedRisk}`}></div>
                              <div className="problem-info">
                                <span className="problem-title">
                                  {riskKey === 'heart' ? 'Heart Health' :
                                   riskKey === 'lungs' ? 'Lung Health' :
                                   riskKey === 'brain' ? 'Brain Health' :
                                   riskKey === 'diabetes' ? 'Metabolic Health' : 'Joint Health'}
                                </span>
                                <p className="problem-description">{risk.reason}</p>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                    
                    <div className="slideshow-age-card">
                      <div className="age-comparison">
                        <div className="age-item">
                          <span className="age-label">Chronological Age</span>
                          <span className="age-value">{userData.Age + getTimeframeOptions()[currentYearIndex]}</span>
                        </div>
                        <div className="age-item">
                          <span className="age-label">Biological Age</span>
                          <span className="age-value">
                            {keepSameLifestyle 
                              ? Math.round(userData.Age + getTimeframeOptions()[currentYearIndex] + 
                                  (getTimeframeOptions()[currentYearIndex] > 20 ? 8 : 4))
                              : Math.round(userData.Age + getTimeframeOptions()[currentYearIndex] - 2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="final-slide">
                  <h3>Take Action Before It's Too Late</h3>
                  <div className="final-message">
                    <p>Your daily habits today shape your health tomorrow.</p>
                    <p>Small changes can have a big impact on your future wellbeing.</p>
                    <p>The best time to start is now.</p>
                  </div>
                  <button 
                    className="primary-button start-again-button" 
                    onClick={stopSlideshow}
                  >
                    Back to Digital Twin
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content - Avatar and Sliders */}
      {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && (
        <div className="future-self-container">
          {/* Avatar Section */}
          <div className="avatar-section">
            <h3>Your Body at Age {projectedAge}</h3>
            
            <div className="avatar-container">
              {/* Custom avatar image */}
              <div className="custom-avatar">
                 <img src="/avatar-image.png" alt="Digital Twin Avatar" className="avatar-image" />
                
                {/* Health risk indicators as overlays */}
                {healthRisks.heart && (
                  <div className={`risk-indicator heart-indicator risk-${healthRisks.heart.risk}`}>
                    <div className="indicator-line"></div>
                    <div className="risk-tooltip">
                      <span className="risk-title">Heart Health</span>
                      <p>{healthRisks.heart.reason}</p>
                    </div>
                  </div>
                )}
                
                {healthRisks.lungs && (
                  <div className={`risk-indicator lungs-indicator risk-${healthRisks.lungs.risk}`}>
                    <div className="indicator-line"></div>
                    <div className="risk-tooltip">
                      <span className="risk-title">Lung Health</span>
                      <p>{healthRisks.lungs.reason}</p>
                    </div>
                  </div>
                )}
                
                {healthRisks.brain && (
                  <div className={`risk-indicator brain-indicator risk-${healthRisks.brain.risk}`}>
                    <div className="indicator-line"></div>
                    <div className="risk-tooltip">
                      <span className="risk-title">Brain Health</span>
                      <p>{healthRisks.brain.reason}</p>
                    </div>
                  </div>
                )}
                
                {healthRisks.diabetes && (
                  <div className={`risk-indicator diabetes-indicator risk-${healthRisks.diabetes.risk}`}>
                    <div className="indicator-line"></div>
                    <div className="risk-tooltip">
                      <span className="risk-title">Metabolic Health</span>
                      <p>{healthRisks.diabetes.reason}</p>
                    </div>
                  </div>
                )}
                
                {healthRisks.joints && (
                  <div className={`risk-indicator joints-indicator risk-${healthRisks.joints.risk}`}>
                    <div className="indicator-line"></div>
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
          
          {/* Habit Sliders Section */}
          <div className="habits-section">
            <h3>Adjust Your Habits</h3>
            <p className="section-description">
              See how lifestyle changes could affect your future health.
            </p>
            
            <div className="sliders-container">
              {/* Sleep slider - weekdays */}
              <div className="slider-item">
                <label>
                  Sleep on Weekdays (hours): <span className="slider-value">{userData.sleep_weekdays}</span>
                </label>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="0.5" 
                  value={userData.sleep_weekdays} 
                  onChange={(e) => handleSliderChange('sleep_weekdays', parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>4h</span>
                  <span>8h</span>
                  <span>12h</span>
                </div>
              </div>
              
              {/* Sleep slider - weekends */}
              <div className="slider-item">
                <label>
                  Sleep on Weekends (hours): <span className="slider-value">{userData.sleep_weekends}</span>
                </label>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="0.5" 
                  value={userData.sleep_weekends} 
                  onChange={(e) => handleSliderChange('sleep_weekends', parseFloat(e.target.value))}
                />
                <div className="slider-labels">
                  <span>4h</span>
                  <span>8h</span>
                  <span>12h</span>
                </div>
              </div>
              
              {/* Physical activity - moderate */}
              <div className="slider-item">
                <label>
                  Moderate Physical Activity (min/week): <span className="slider-value">{userData.freq_moderate_activity}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  step="10" 
                  value={userData.freq_moderate_activity} 
                  onChange={(e) => handleSliderChange('freq_moderate_activity', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0 min</span>
                  <span>150 min</span>
                  <span>300 min</span>
                </div>
              </div>
              
              {/* Physical activity - intense */}
              <div className="slider-item">
                <label>
                  Intense Physical Activity (min/week): <span className="slider-value">{userData.freq_intense_activity}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="180" 
                  step="5" 
                  value={userData.freq_intense_activity} 
                  onChange={(e) => handleSliderChange('freq_intense_activity', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0 min</span>
                  <span>75 min</span>
                  <span>180 min</span>
                </div>
              </div>
              
              {/* Sedentary time */}
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
              
              {/* Smoking status */}
              <div className="button-group-item">
                <label>
                  Smoking Status:
                </label>
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
              
              {/* Alcohol frequency */}
              <div className="slider-item">
                <label>
                  Alcohol (days per week): <span className="slider-value">{userData.freq_alcohol}</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="7" 
                  step="1" 
                  value={userData.freq_alcohol} 
                  onChange={(e) => handleSliderChange('freq_alcohol', parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0</span>
                  <span>3-4</span>
                  <span>7</span>
                </div>
              </div>
              
              {/* Weight slider */}
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
      
      {/* Action buttons */}
      {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && (
        <div className="action-buttons">
          <button className="primary-button">
            Save My Digital Twin
          </button>
          <button className="secondary-button">
            Get Personalized Recommendations
          </button>
        </div>
      )}
    </div>
  );
}

export default DigitalTwinPage;
