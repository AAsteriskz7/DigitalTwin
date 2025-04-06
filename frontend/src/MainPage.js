import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';

function DigitalTwinPage() {
  const slideshowStartTimeRef = useRef(null);

  const [userData, setUserData] = useState({
    Age: 35,
    Gender: "1",
    blood_pressure: "1",
    cholesterol: "1",
    diabetes: "1",
    mins_sedentary: 8,
    physical_activity: 3,
    smoked_100_cigarettes: "1",
    smoke: "1",
    tobacco: "1",
    weight_loss: "1",
    sleep: 7.8,
    weight: 81.6,
    height: 70.0,
    BMI: 25.8
  });

  useEffect(() => {
    try {
      const formDataOne = JSON.parse(localStorage.getItem('formDataOne') || '{}');
      const formDataTwo = JSON.parse(localStorage.getItem('formDataTwo') || '{}');
      const formDataThree = JSON.parse(localStorage.getItem('formDataThree') || '{}');
      
      if (Object.keys(formDataOne).length === 0) {
        return;
      }
      
      const weekdaySleep = parseFloat(formDataTwo.sleepWeekdays) || 7;
      const weekendSleep = parseFloat(formDataTwo.sleepWeekends) || 8;
      const avgSleep = ((weekdaySleep * 5) + (weekendSleep * 2)) / 7;
      
      const moderate = parseInt(formDataTwo.moderateActivity) || 0;
      const intense = parseInt(formDataTwo.intenseActivity) || 0;
      const totalActivity = moderate + intense;
      
      const heightInInches = formDataOne.heightCm 
        ? parseFloat(formDataOne.heightCm) / 2.54 
        : 70.0;
      
      const transformedData = {
        Age: parseInt(formDataOne.age) || 35,
        Gender: formDataOne.sex === "Male" ? "1" : "2",
        blood_pressure: formDataThree.highBloodPressure === "Yes" ? "1" : "2",
        cholesterol: formDataThree.highCholesterol === "Yes" ? "1" : "2",
        diabetes: "2",
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
        BMI: 0 
      };
      
      setUserData(transformedData);
      
    } catch (err) {
      console.error('Error loading form data:', err);
    }
  }, []);

  const [yearsInFuture, setYearsInFuture] = useState(10);
  const [viewMode, setViewMode] = useState('single');
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [keepSameLifestyle, setKeepSameLifestyle] = useState(true);
  const [showLifestyleButtons, setShowLifestyleButtons] = useState(false);
  const [showLifestyleSliders, setShowLifestyleSliders] = useState(false);
  const [animatingProblems, setAnimatingProblems] = useState(false);

  const [slideshowUserData, setSlideshowUserData] = useState({});

  const [healthRisks, setHealthRisks] = useState({});
  const [biologicalAge, setBiologicalAge] = useState(0);

  const projectedAge = userData.Age + yearsInFuture;

  useEffect(() => {
    const heightInMeters = userData.height * 0.0254;
    const calculatedBMI = userData.weight / (heightInMeters ** 2);
    setUserData(prevData => ({
      ...prevData,
      BMI: parseFloat(calculatedBMI.toFixed(1))
    }));
  }, [userData.weight, userData.height]);

  const getTimeframeOptions = () => {
    const options = [];
    const maxAge = 80;
    const currentAge = userData.Age;
    for (let i = 10; currentAge + i <= maxAge; i += 10) {
      options.push(i);
    }
    if (options.length === 0 && currentAge < 100) {
      options.push(Math.min(10, 100 - currentAge));
    }
    return options;
  };

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

  useEffect(() => {
    if (!slideshowActive) return;
    const calculateSlideshowHealthRisks = () => {
      const risks = {};
      const data = userData;
      const years = getTimeframeOptions()[currentYearIndex] || yearsInFuture;
  
      const getDescription = (riskType, years) => {
        switch (riskType) {
          case 'heart':
            if (years < 15)
              return "Occasional shortness of breath during brisk walks and slight fatigue when climbing stairs.";
            else if (years < 25)
              return "Even light jogging or playing sports leaves you noticeably winded.";
            else if (years < 35)
              return "Everyday tasks like shopping or family play become increasingly challenging as your heart struggles.";
            else if (years < 45)
              return "Simple chores and moderate exertion now frequently lead to fatigue and breathlessness.";
            else if (years < 55)
              return "Your heart condition significantly limits physical activity, demanding extra caution.";
            else
              return "Severe heart limitations make even minimal activity exhausting, with daily tasks becoming nearly impossible.";
          case 'diabetes':
            if (years < 15)
              return "Minor energy dips after meals and occasional sluggishness start affecting your routine.";
            else if (years < 25)
              return "Frequent energy drops and slight dizziness make maintaining your pace more challenging.";
            else if (years < 35)
              return "Noticeable fatigue and unstable blood sugar levels begin to disrupt work and daily tasks.";
            else if (years < 45)
              return "Persistent tiredness and erratic energy increasingly hinder your social and physical activities.";
            else if (years < 55)
              return "Severe fluctuations in energy and sugar levels significantly curtail your lifestyle.";
            else
              return "Diabetes dominates your day—relentless fatigue and low stamina make even simple tasks overwhelming.";
          case 'lungs':
            if (years < 15)
              return "Mild wheezing during exercise means you occasionally struggle to catch your breath.";
            else if (years < 25)
              return "Shortness of breath appears during everyday activities like walking or climbing stairs.";
            else if (years < 35)
              return "Diminishing lung capacity makes moderate exercise and prolonged activity noticeably challenging.";
            else if (years < 45)
              return "Breathing difficulties intensify, forcing frequent pauses even during light exertion.";
            else if (years < 55)
              return "Persistent respiratory issues now severely limit your activity, with minimal exertion causing discomfort.";
            else
              return "Advanced lung problems leave you with constant breathing struggles, even during simple movements.";
          case 'brain':
            if (years < 15)
              return "Minor memory lapses and brief concentration issues occasionally interrupt your day.";
            else if (years < 25)
              return "Emerging focus difficulties begin to affect work and daily decision-making.";
            else if (years < 35)
              return "Cognitive decline becomes more evident, impacting both routine tasks and complex problem-solving.";
            else if (years < 45)
              return "More pronounced memory and concentration issues slow your mental processing and productivity.";
            else if (years < 55)
              return "Severe cognitive challenges make everyday tasks hard to manage, often leaving you overwhelmed.";
            else
              return "Advanced cognitive impairment drastically reduces mental clarity, making even simple activities exhausting.";
          case 'joints':
            if (years < 15)
              return "You notice occasional stiffness after long periods of inactivity.";
            else if (years < 25)
              return "Mild joint pain starts to affect short bursts of physical activity.";
            else if (years < 35)
              return "Ongoing joint discomfort makes routine movements and sports increasingly challenging.";
            else if (years < 45)
              return "Chronic joint pain and stiffness significantly limit your mobility and ease of movement.";
            else if (years < 55)
              return "Persistent joint deterioration severely restricts mobility, making most physical activities painful.";
            else
              return "Advanced joint degeneration causes constant, debilitating pain, greatly hindering everyday tasks.";
          default:
            return "";
        }
      };
      
  
      if (data.blood_pressure === "1" || data.cholesterol === "1" || data.smoke === "1") {
        let riskLevel = 'medium';
        if ((data.blood_pressure === "1" && data.cholesterol === "1") ||
            (data.smoke === "1" && years >= 20)) {
          riskLevel = 'high';
        }
        risks.heart = {
          risk: riskLevel,
          reason: getDescription('heart', years),
          location: 'chest'
        };
      }
  
      if (data.diabetes === "1" || data.BMI > 30 || data.mins_sedentary > 600) {
        let riskLevel = 'medium';
        if (data.diabetes === "1" && data.BMI > 30) {
          riskLevel = 'high';
        }
        risks.diabetes = {
          risk: riskLevel,
          reason: getDescription('diabetes', years),
          location: 'abdomen'
        };
      }
  
      if (data.smoke === "1" || data.smoke === "2" || data.tobacco === "1") {
        let riskLevel = data.smoke === "1" ? 'high' : 'medium';
        risks.lungs = {
          risk: riskLevel,
          reason: getDescription('lungs', years),
          location: 'lungs'
        };
      }
  
      const avgSleep = data.sleep;
      if (avgSleep < 6 || avgSleep > 9) {
        let riskLevel = 'low';
        if (years >= 30 && avgSleep < 5) riskLevel = 'medium';
        risks.brain = {
          risk: riskLevel,
          reason: getDescription('brain', years),
          location: 'head'
        };
      }
  
      if (data.BMI > 30 || data.physical_activity < 10) {
        let riskLevel = 'medium';
        if (data.BMI > 35 && years >= 20) riskLevel = 'high';
        risks.joints = {
          risk: riskLevel,
          reason: getDescription('joints', years),
          location: 'knees'
        };
      }
  
      return risks;
    };
  
    setHealthRisks(calculateSlideshowHealthRisks());
  }, [
    slideshowActive,
    currentYearIndex,
    userData,
    yearsInFuture,
    showLifestyleSliders,
    keepSameLifestyle,
    slideshowUserData
  ]);

  const handleSliderChange = (field, value) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const handleSlideshowSliderChange = (field, value) => {
    setSlideshowUserData({
      ...slideshowUserData,
      [field]: value
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'single' ? 'all' : 'single');
  };

  const startFuturePreview = () => {
    setSlideshowUserData({ ...userData });
    setCurrentYearIndex(0);
    setAnimatingProblems(true);
    setSlideshowActive(true);
    slideshowStartTimeRef.current = Date.now();
    document.body.classList.add('slideshow-fullscreen-active');
  };

  const startSlideshowAfterChanges = () => {
    setShowLifestyleSliders(false);
    setSlideshowActive(true);
    setCurrentYearIndex(0);
    setAnimatingProblems(true);
  };

  const stopSlideshow = () => {
    setSlideshowActive(false);
    document.body.classList.remove('slideshow-fullscreen-active');
  };

  const goToNextSlide = () => {
    const yearOptions = getTimeframeOptions();
    if (currentYearIndex < yearOptions.length - 1) {
      setAnimatingProblems(false);
      setTimeout(() => {
        setCurrentYearIndex(prev => prev + 1);
        setAnimatingProblems(true);
      }, 50);
    } else {
      setCurrentYearIndex(yearOptions.length);
    }
  };

  return (
    <div className="results-wrapper">
    <div className="white_background"></div>
    <div className="digital-twin-container">
      <div className="digital-twin-header">
        <h1>Your Digital Twin</h1>
        <p>See how your habits today affect your biological age trajectory</p>
      </div>

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
                                left: isLeft ? '-80px' : 'auto',
                                right: !isLeft ? '-80px' : 'auto',
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
                                marginTop: index > 0 ? `${(index % 3) * 50}px` : '0'
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

      {viewMode === 'single' && !slideshowActive && !showLifestyleButtons && !showLifestyleSliders && (
        <div className="future-self-container">
          <div className="avatar-section">
            <h3>Your Body at Age {userData.Age}</h3>
            <div className="avatar-container">
              <div className="custom-avatar">
                <img src="/avatar-image.png" alt="Digital Twin Avatar" className="avatar-image" />
                
                <div className="risk-indicator heart-indicator risk-high" style={{top: "130px", left: "127px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Heart Health</span>
                    <p>Blood pressure status: {userData.blood_pressure === "1" ? "High" : "Normal"}</p>
                  </div>
                </div>
                
                <div className="risk-indicator sleep-indicator risk-medium" style={{top: "40px", left: "110px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Sleep Health</span>
                    <p>Sleep duration: {userData.sleep} hours/day</p>
                  </div>
                </div>
                
                <div className="risk-indicator fitness-indicator risk-medium" style={{top: "305px", left: "140px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Physical Fitness</span>
                    <p>Activity level: {userData.physical_activity} times/week</p>
                  </div>
                </div>
                
                <div className="risk-indicator metabolic-indicator risk-high" style={{top: "210px", left: "95px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Metabolic Health</span>
                    <p>Daily sitting time: {userData.mins_sedentary} hours</p>
                  </div>
                </div>
                
                <div className="risk-indicator lungs-indicator risk-high" style={{top: "150px", left: "97px", zIndex: 5}}>
                  <div className="risk-tooltip">
                    <span className="risk-title">Lung Health</span>
                    <p>Smoking status: {userData.smoke === "1" ? "Daily smoker" : userData.smoke === "2" ? "Occasional smoker" : "Non-smoker"}</p>
                  </div>
                </div>
                
                <div className="risk-indicator cholesterol-indicator risk-medium" style={{top: "165px", left: "127px", zIndex: 5}}>
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
    </div>
  );
}

export default DigitalTwinPage;