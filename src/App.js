import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState('');
  const [crowdLevel, setCrowdLevel] = useState('Low');
  const [waitTime, setWaitTime] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState('');

  const historyData = [
    { time: '9 AM', wait: 15 },
    { time: '11 AM', wait: 45 },
    { time: '1 PM', wait: 20 },
    { time: '3 PM', wait: 35 },
    { time: '5 PM', wait: 60 },
    { time: '7 PM', wait: 25 },
  ];

  const fetchLocations = () => {
    axios.get('https://queueless-mumbai.onrender.com')
      .then(res => setLocations(res.data))
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/api/report', {
      location_id: parseInt(selectedLoc),
      crowd_level: crowdLevel,
      estimated_wait: parseInt(waitTime)
    }).then(() => {
      showNotification("🚀 Live Report Updated Successfully!");
      fetchLocations();
    }).catch(err => console.error("Error submitting report:", err));
  };

  const getBadgeStyle = (level) => {
    switch (level) {
      case 'Low':
        return { background: '#e6f4ea', color: '#137333', border: '1px solid #ceedd5' };
      case 'Medium':
        return { background: '#fef7e0', color: '#b06000', border: '1px solid #fde293' };
      case 'High':
        return { background: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf' };
      default:
        return { background: '#f1f3f4', color: '#5f6368', border: '1px solid #dadce0' };
    }
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loc.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || loc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#202124' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#202124', color: '#fff', padding: '12px 24px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: '600', fontSize: '14px' }}>
          {toast}
        </div>
      )}

      {/* Header Bar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>⚡</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>QueueLess Mumbai</h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#5f6368' }}>Real-time Live Waiting & Crowd Analytics</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdmin(!isAdmin)} 
          style={{ background: isAdmin ? '#feefc3' : '#e8f0fe', color: isAdmin ? '#b06000' : '#1a73e8', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        >
          {isAdmin ? '👨‍💼 Admin Mode Active' : '👤 User Mode'}
        </button>
      </header>

      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="🔍 Search RTO, Hospital, Station, Samaj Kalyan..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '240px', padding: '12px 16px', borderRadius: '10px', border: '1px solid #dadce0', fontSize: '14px', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'RTO', 'Hospital', 'Passport', 'Government'].map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                style={{ 
                  padding: '10px 18px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  fontSize: '13px',
                  backgroundColor: selectedCategory === cat ? '#202124' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#5f6368',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live Status Cards Grid */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>📍 Live Locations Status</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {filteredLocations.map(loc => (
            <div key={loc.id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{loc.name}</h3>
                  <span style={{ fontSize: '12px', color: '#70757a' }}>{loc.area}</span>
                </div>
                <span style={{ ...getBadgeStyle(loc.current_crowd), padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                  {loc.current_crowd}
                </span>
              </div>

              {/* CONFIDENCE BADGE (1 User vs Verified counter) */}
              <div style={{ marginBottom: '12px' }}>
                {loc.user_count === 0 ? (
                  <span style={{ fontSize: '11px', color: '#70757a', background: '#f1f3f4', padding: '3px 8px', borderRadius: '10px' }}>⚪ No recent reports</span>
                ) : loc.user_count === 1 ? (
                  <span style={{ fontSize: '11px', color: '#b06000', background: '#fef7e0', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>🟡 Reported by 1 user (Unverified)</span>
                ) : (
                  <span style={{ fontSize: '11px', color: '#137333', background: '#e6f4ea', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>🟢 Verified by {loc.user_count} users</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', margin: '12px 0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#70757a' }}>ESTIMATED WAIT</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#202124' }}>⏱ {loc.estimated_wait} mins</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#70757a' }}>LAST UPDATED</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{loc.last_updated}</div>
                </div>
              </div>

              {/* Crowd Trend History Chart */}
              <div style={{ marginTop: '15px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#5f6368', display: 'block', marginBottom: '8px' }}>
                  📊 TODAY'S WAITING TREND (MINUTES)
                </span>
                <div style={{ width: '100%', height: 100 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                      <defs>
                        <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis hide domain={[0, 70]} />
                      <Tooltip formatter={(value) => [`${value} mins`, 'Wait Time']} />
                      <Area type="monotone" dataKey="wait" stroke="#1a73e8" fillOpacity={1} fill="url(#colorWait)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Admin Control Options */}
              {isAdmin && (
                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ea4335', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#ea4335', fontWeight: '700' }}>⚠️ ADMIN CONTROL</span>
                  <button 
                    onClick={() => showNotification(`Reset status for ${loc.name}`)}
                    style={{ backgroundColor: '#fce8e6', color: '#c5221f', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Clear Spam Reports
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>

        {/* Live Crowd Reporting Form */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0, marginBottom: '5px' }}>📝 Report Current Crowd</h2>
          <p style={{ fontSize: '13px', color: '#5f6368', marginBottom: '20px' }}>Help fellow Mumbaikars avoid long queues!</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>SELECT LOCATION</label>
              <select onChange={(e) => setSelectedLoc(e.target.value)} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '14px' }}>
                <option value="">-- Choose Location --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.area})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>CROWD LEVEL</label>
              <select onChange={(e) => setCrowdLevel(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '14px' }}>
                <option value="Low">🟢 Low (Fast moving)</option>
                <option value="Medium">🟠 Medium (Moderate wait)</option>
                <option value="High">🔴 High (Very crowded)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>ESTIMATED WAIT TIME (MINUTES)</label>
              <input 
                type="number" 
                value={waitTime} 
                onChange={(e) => setWaitTime(e.target.value)} 
                required 
                style={{ width: '95%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '14px' }}
              />
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', background: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '10px' }}>
              🚀 Submit Live Update
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;