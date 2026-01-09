#!/bin/bash

echo "🎓 Setting up Alumni Connect Demo..."

# Create .env file for backend
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/alumni_connect
JWT_SECRET=demo-jwt-secret-key-change-in-production
PORT=3001
NODE_ENV=development
EOF

# Create package.json for frontend
cat > frontend/package.json << EOF
{
  "name": "alumni-connect-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:3001"
}
EOF

# Create basic CSS for frontend
cat > frontend/src/App.css << EOF
.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.header {
  background: #1f2937;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header nav button {
  background: none;
  border: 1px solid #374151;
  color: white;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
}

.header nav button.active {
  background: #3b82f6;
}

.main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.login-form input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

.login-form button {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.alumni-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.alumni-card, .event-card, .job-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: white;
}

.alumni-card h3, .event-card h3, .job-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.alumni-card p, .event-card p, .job-card p {
  margin: 0.25rem 0;
  color: #6b7280;
}

.job-card a {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 0.25rem;
}
EOF

echo "✅ Demo setup complete!"
echo ""
echo "🚀 To start the demo:"
echo "1. Start database: docker-compose up postgres -d"
echo "2. Load demo data: docker exec -i alumni-connect-postgres-1 psql -U postgres -d alumni_connect < demo-data.sql"
echo "3. Start backend: cd backend && npm install && npm run dev"
echo "4. Start frontend: cd frontend && npm install && npm start"
echo ""
echo "📧 Demo login credentials:"
echo "Admin: admin@stanford.edu / password"
echo "Alumni: john.doe@gmail.com / password"
echo ""
echo "🌐 Access at: http://localhost:3000"
