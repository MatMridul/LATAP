import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('directory');
  const [alumni, setAlumni] = useState([]);
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [alumniRes, eventsRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/alumni`, { headers }),
        fetch(`${API_BASE}/events`, { headers }),
        fetch(`${API_BASE}/jobs`, { headers })
      ]);

      setAlumni(await alumniRes.json());
      setEvents(await eventsRes.json());
      setJobs(await jobsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        fetchData();
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Alumni Connect</h1>
        <nav>
          <button 
            className={activeTab === 'directory' ? 'active' : ''}
            onClick={() => setActiveTab('directory')}
          >
            Directory
          </button>
          <button 
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={activeTab === 'jobs' ? 'active' : ''}
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
        </nav>
        <button onClick={() => {
          localStorage.removeItem('token');
          setUser(null);
        }}>
          Logout
        </button>
      </header>

      <main className="main">
        {activeTab === 'directory' && <AlumniDirectory alumni={alumni} />}
        {activeTab === 'events' && <EventsList events={events} />}
        {activeTab === 'jobs' && <JobsList jobs={jobs} />}
      </main>
    </div>
  );
}

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="login-form">
      <h2>Alumni Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

const AlumniDirectory = ({ alumni }) => (
  <div className="alumni-directory">
    <h2>Alumni Directory</h2>
    <div className="alumni-grid">
      {alumni.map(person => (
        <div key={person.id} className="alumni-card">
          <h3>{person.first_name} {person.last_name}</h3>
          <p>Class of {person.graduation_year}</p>
          <p>{person.current_position} at {person.current_company}</p>
          <p>{person.location}</p>
        </div>
      ))}
    </div>
  </div>
);

const EventsList = ({ events }) => (
  <div className="events-list">
    <h2>Upcoming Events</h2>
    {events.map(event => (
      <div key={event.id} className="event-card">
        <h3>{event.title}</h3>
        <p>{new Date(event.event_date).toLocaleDateString()}</p>
        <p>{event.location}</p>
        <p>{event.description}</p>
      </div>
    ))}
  </div>
);

const JobsList = ({ jobs }) => (
  <div className="jobs-list">
    <h2>Job Opportunities</h2>
    {jobs.map(job => (
      <div key={job.id} className="job-card">
        <h3>{job.title}</h3>
        <p>{job.company} - {job.location}</p>
        <p>{job.job_type}</p>
        <p>{job.description}</p>
        {job.application_url && (
          <a href={job.application_url} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        )}
      </div>
    ))}
  </div>
);

export default App;
