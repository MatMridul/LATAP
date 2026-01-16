#!/bin/bash

# Lightsail Instance Startup Script
# Installs and configures complete LATAP stack

set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Install Redis
apt-get install -y redis-server

# Install Nginx
apt-get install -y nginx

# Install PM2 for process management
npm install -g pm2

# Configure PostgreSQL
sudo -u postgres psql <<EOF
CREATE DATABASE latap;
CREATE USER latap_user WITH ENCRYPTED PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE latap TO latap_user;
ALTER DATABASE latap OWNER TO latap_user;
EOF

# Configure Redis
sed -i 's/^bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
sed -i 's/^# requirepass foobared/requirepass change_this_redis_password/' /etc/redis/redis.conf
systemctl restart redis-server

# Create app directory
mkdir -p /opt/latap
cd /opt/latap

# Clone repository (replace with your repo)
# git clone https://github.com/MatMridul/LATAP.git .

# For now, create placeholder
cat > /opt/latap/.env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://latap_user:change_this_password@localhost:5432/latap
REDIS_URL=redis://:change_this_redis_password@localhost:6379
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
AWS_REGION=us-east-1
S3_BUCKET=latap-documents
FROM_EMAIL=noreply@latap.com
FRONTEND_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EOF

# Install dependencies (when code is present)
# cd /opt/latap/backend && npm ci --production

# Configure Nginx
cat > /etc/nginx/sites-available/latap <<'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/latap /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Start services with PM2 (when code is present)
# cd /opt/latap/backend && pm2 start server.js --name latap-backend
# cd /opt/latap && pm2 start "npm run dev" --name latap-frontend
# pm2 startup systemd
# pm2 save

# Configure automatic updates
cat > /etc/cron.daily/latap-update <<'EOF'
#!/bin/bash
cd /opt/latap
git pull
cd backend && npm ci --production
pm2 restart all
EOF
chmod +x /etc/cron.daily/latap-update

# Setup log rotation
cat > /etc/logrotate.d/latap <<'EOF'
/opt/latap/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

echo "✅ Lightsail setup complete!"
echo "📝 Remember to:"
echo "  1. Change database password"
echo "  2. Change Redis password"
echo "  3. Update .env with real values"
echo "  4. Deploy application code"
echo "  5. Run database migrations"
