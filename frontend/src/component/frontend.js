import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [email, setEmail] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get-alerts');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSetAlert = async () => {
    // Validate form fields
    if (!email || !cryptoSymbol || !targetPrice) {
      alert('All fields are required!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/alert/alert', { email, cryptoSymbol, targetPrice });
      fetchAlerts();
      // Reset form fields
      setEmail('');
      setCryptoSymbol('');
      setTargetPrice('');
      alert('Alert set successfully!');
    } catch (error) {
      console.error('Error setting alert:', error);
    }
  };

  return (
    <div className="container">
      <h2>Set Alert</h2>
      <div className="form-group">
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Cryptocurrency Symbol:</label>
        <input type="text" value={cryptoSymbol} onChange={(e) => setCryptoSymbol(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Target Price:</label>
        <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
      </div>
      <button className="set-alert-btn" onClick={handleSetAlert}>Set Alert</button>

      <h2>Alerts</h2>
      <ul className="alert-list">
        {alerts.map((alert) => (
          <li key={alert._id} className="alert-item">
            <span>Email: {alert.email}</span>
            <span>Crypto Symbol: {alert.cryptoSymbol}</span>
            <span>Target Price: {alert.targetPrice}</span>
            <span>Triggered: {alert.triggered ? 'Yes' : 'No'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
