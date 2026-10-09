"use client";

import { useState, useEffect } from 'react';
import './globals.css';
import { MapPin, IndianRupee, Clock, Compass, Sparkles, Map, Route, Utensils, Landmark, TreePine } from 'lucide-react';

const INTERESTS = [
  { id: 'history', label: 'History', icon: <Landmark size={18} /> },
  { id: 'food', label: 'Local Food', icon: <Utensils size={18} /> },
  { id: 'nature', label: 'Nature', icon: <TreePine size={18} /> },
  { id: 'culture', label: 'Culture', icon: <Compass size={18} /> }
];

const MOCK_PLACES = [
  { id: 'p1', name: 'Shaniwar Wada', cost: 100, time: 2, category: 'history', desc: 'Historic Maratha fort.' },
  { id: 'p2', name: 'Aga Khan Palace', cost: 200, time: 2, category: 'history', desc: 'Majestic palace with Gandhi memorial.' },
  { id: 'p3', name: 'Kelkar Museum', cost: 150, time: 3, category: 'culture', desc: 'Vast collection of Indian artifacts.' },
  { id: 'p4', name: 'Osho Teerth Park', cost: 50, time: 1.5, category: 'nature', desc: 'Serene Japanese-style garden.' },
  { id: 'p5', name: 'Pashan Lake', cost: 0, time: 2, category: 'nature', desc: 'Quiet lake perfect for bird watching.' },
  { id: 'p6', name: 'FC Road Street Food', cost: 300, time: 1.5, category: 'food', desc: 'Bustling street with local delicacies.' },
  { id: 'p7', name: 'Vaishali Restaurant', cost: 500, time: 2, category: 'food', desc: 'Iconic South Indian food joint.' },
  { id: 'p8', name: 'Dagdusheth Temple', cost: 0, time: 1, category: 'culture', desc: 'Famous Ganesh temple.' }
];

export default function Home() {
  const [formData, setFormData] = useState({
    city: 'Pune', // Default city
    budget: '',
    startTime: '',
    endTime: '',
    interests: []
  });

  const [errors, setErrors] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [itineraries, setItineraries] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    if (showResults) {
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [showResults]);

  const toggleInterest = (id) => {
    setFormData(prev => {
      const isSelected = prev.interests.includes(id);
      if (isSelected) {
        return { ...prev, interests: prev.interests.filter(i => i !== id) };
      } else {
        return { ...prev, interests: [...prev.interests, id] };
      }
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.budget || formData.budget <= 0) newErrors.budget = 'Please enter a valid budget';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (formData.interests.length === 0) newErrors.interests = 'Select at least one interest';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateItineraries = () => {
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const totalHours = (end - start) / (1000 * 60 * 60);
    const maxBudget = Number(formData.budget);

    // Filter places by selected interests
    let preferredPlaces = MOCK_PLACES.filter(p => formData.interests.includes(p.category));
    if (preferredPlaces.length === 0) preferredPlaces = MOCK_PLACES;

    const createPlan = (sortedPlaces, title, badge) => {
      let currentCost = 0;
      let currentHours = 0;
      const selected = [];
      
      for (const place of sortedPlaces) {
        if (currentCost + place.cost <= maxBudget && currentHours + place.time <= totalHours) {
          selected.push(place);
          currentCost += place.cost;
          currentHours += place.time;
        }
      }
      
      if (selected.length === 0) return null;

      const categories = [...new Set(selected.map(p => p.category))].join(', ');
      const desc = selected.map(p => p.name).join(' ➔ ');

      return {
        id: Math.random().toString(36).substring(7),
        title,
        badge,
        desc: `Visit: ${desc}`,
        cost: currentCost,
        time: `${currentHours} hrs`,
        focus: categories
      };
    };

    const sortedByCost = [...preferredPlaces].sort((a, b) => a.cost - b.cost);
    const plan1 = createPlan(sortedByCost, 'Budget Explorer', 'Cheapest');

    const sortedByTime = [...preferredPlaces].sort((a, b) => b.time - a.time);
    const plan2 = createPlan(sortedByTime, 'Immersive Journey', 'Balanced Pick');

    const sortedByFastest = [...preferredPlaces].sort((a, b) => a.time - b.time);
    const plan3 = createPlan(sortedByFastest, 'Whirlwind Tour', 'Most Sights');

    const results = [plan1, plan2, plan3].filter(Boolean);
    
    // Deduplicate identical plans
    const uniqueResults = [];
    const seen = new Set();
    for (const r of results) {
      if (!seen.has(r.desc)) {
        seen.add(r.desc);
        uniqueResults.push(r);
      }
    }

    if (uniqueResults.length === 0) {
      return [{
        id: 'error',
        title: 'No Plans Found',
        badge: 'Too Constrained',
        desc: 'Your budget or time limit is too tight for the selected interests.',
        cost: 0,
        time: '0 hrs',
        focus: 'None'
      }];
    }

    return uniqueResults;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setShowResults(false);
      setSelectedPlanId(null);
      
      setTimeout(() => {
        const generated = generateItineraries();
        setItineraries(generated);
        setIsLoading(false);
        setShowResults(true);
      }, 1500);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Localoom</h1>
        <p className="subtitle">AI-powered city exploration crafted for your wallet and schedule.</p>
      </header>

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="form-grid">
          
          <div className="input-group">
            <label className="label">Destination City</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-low)' }} />
              <input 
                type="text" 
                className="input" 
                style={{ paddingLeft: '45px' }}
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="e.g. Pune"
              />
            </div>
            {errors.city && <span className="error-msg">{errors.city}</span>}
          </div>

          <div className="input-group">
            <label className="label">Maximum Budget (INR)</label>
            <div style={{ position: 'relative' }}>
              <IndianRupee size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-low)' }} />
              <input 
                type="number" 
                className="input" 
                style={{ paddingLeft: '45px' }}
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="e.g. 1500"
              />
            </div>
            {errors.budget && <span className="error-msg">{errors.budget}</span>}
          </div>

          <div className="input-group">
            <label className="label">Start Time</label>
            <div style={{ position: 'relative' }}>
              <Clock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-low)' }} />
              <input 
                type="time" 
                className="input" 
                style={{ paddingLeft: '45px' }}
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            {errors.startTime && <span className="error-msg">{errors.startTime}</span>}
          </div>

          <div className="input-group">
            <label className="label">End Time</label>
            <div style={{ position: 'relative' }}>
              <Clock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-low)' }} />
              <input 
                type="time" 
                className="input" 
                style={{ paddingLeft: '45px' }}
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
            {errors.endTime && <span className="error-msg">{errors.endTime}</span>}
          </div>

          <div className="input-group interests-container">
            <label className="label">What do you want to explore?</label>
            <div className="chips-grid">
              {INTERESTS.map(interest => (
                <div 
                  key={interest.id}
                  className={`chip ${formData.interests.includes(interest.id) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {interest.icon}
                  {interest.label}
                </div>
              ))}
            </div>
            {errors.interests && <span className="error-msg">{errors.interests}</span>}
          </div>

          <button type="submit" className="btn-primary">
            {isLoading ? (
              <span>Crafting your journey...</span>
            ) : (
              <>
                <Sparkles size={20} />
                Build My Plan
              </>
            )}
          </button>
        </form>
      </div>

      {showResults && (
        <div className="results-section" id="results">
          <div className="results-header">
            <div>
              <h2 className="results-title">Your {formData.city} Adventures</h2>
              <p className="subtitle" style={{ fontSize: '1rem', marginTop: '5px' }}>Based on a budget of ₹{formData.budget}</p>
            </div>
            <span className="mock-badge">Demonstration Results</span>
          </div>

          <div className="options-grid">
            {itineraries.map((plan) => (
              <div 
                key={plan.id} 
                className={`option-card ${selectedPlanId === plan.id ? 'recommended' : ''}`}
              >
                <span className="option-badge">{plan.badge}</span>
                <h3 className="option-title">{plan.title}</h3>
                <p className="option-desc">{plan.desc}</p>
                
                <div className="comparison-list">
                  <div className="comparison-item">
                    <div className="icon-box"><IndianRupee size={20} /></div>
                    <div className="comp-text">
                      <span className="comp-label">Estimated Cost</span>
                      <span className="comp-value">₹{plan.cost}</span>
                    </div>
                  </div>
                  <div className="comparison-item">
                    <div className="icon-box"><Route size={20} /></div>
                    <div className="comp-text">
                      <span className="comp-label">Duration</span>
                      <span className="comp-value">{plan.time}</span>
                    </div>
                  </div>
                  <div className="comparison-item">
                    <div className="icon-box"><Map size={20} /></div>
                    <div className="comp-text">
                      <span className="comp-label">Focus</span>
                      <span className="comp-value" style={{ textTransform: 'capitalize' }}>{plan.focus}</span>
                    </div>
                  </div>
                </div>
                
                {plan.id !== 'error' && (
                  <button 
                    className="btn-select"
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {selectedPlanId === plan.id ? 'Selected' : 'Select This Plan'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
