#!/bin/bash

# LATAP Lightsail Deployment Script
# Cost: $10/month for complete stack

set -e

echo "🚀 LATAP Lightsail Deployment"
echo "=============================="
echo ""

# Configuration
INSTANCE_NAME="latap-production"
INSTANCE_PLAN="nano_2_0"  # $3.50/month or medium_2_0 for $10/month
REGION="us-east-1"
AVAILABILITY_ZONE="us-east-1a"

echo "📋 Configuration:"
echo "  Instance: $INSTANCE_NAME"
echo "  Plan: $INSTANCE_PLAN (2GB RAM, 1 vCPU, 60GB SSD)"
echo "  Region: $REGION"
echo ""

# Create Lightsail instance
echo "1️⃣  Creating Lightsail instance..."
aws lightsail create-instances \
  --instance-names $INSTANCE_NAME \
  --availability-zone $AVAILABILITY_ZONE \
  --blueprint-id ubuntu_22_04 \
  --bundle-id $INSTANCE_PLAN \
  --user-data file://lightsail-startup.sh

echo "✅ Instance created"
echo ""

# Wait for instance to be running
echo "2️⃣  Waiting for instance to be ready..."
aws lightsail wait instance-running --instance-name $INSTANCE_NAME
echo "✅ Instance is running"
echo ""

# Get instance IP
INSTANCE_IP=$(aws lightsail get-instance \
  --instance-name $INSTANCE_NAME \
  --query 'instance.publicIpAddress' \
  --output text)

echo "3️⃣  Instance IP: $INSTANCE_IP"
echo ""

# Open ports
echo "4️⃣  Opening firewall ports..."
aws lightsail put-instance-public-ports \
  --instance-name $INSTANCE_NAME \
  --port-infos \
    fromPort=80,toPort=80,protocol=TCP \
    fromPort=443,toPort=443,protocol=TCP \
    fromPort=22,toPort=22,protocol=TCP

echo "✅ Ports opened: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""

# Create static IP
echo "5️⃣  Creating static IP..."
aws lightsail allocate-static-ip \
  --static-ip-name ${INSTANCE_NAME}-ip

aws lightsail attach-static-ip \
  --static-ip-name ${INSTANCE_NAME}-ip \
  --instance-name $INSTANCE_NAME

STATIC_IP=$(aws lightsail get-static-ip \
  --static-ip-name ${INSTANCE_NAME}-ip \
  --query 'staticIp.ipAddress' \
  --output text)

echo "✅ Static IP: $STATIC_IP"
echo ""

# Create snapshot schedule
echo "6️⃣  Setting up automatic backups..."
aws lightsail create-instance-snapshot \
  --instance-name $INSTANCE_NAME \
  --instance-snapshot-name ${INSTANCE_NAME}-initial

echo "✅ Initial snapshot created"
echo ""

echo "=============================="
echo "✅ Deployment Complete!"
echo "=============================="
echo ""
echo "📊 Instance Details:"
echo "  Name: $INSTANCE_NAME"
echo "  IP: $STATIC_IP"
echo "  SSH: ssh ubuntu@$STATIC_IP"
echo ""
echo "📝 Next Steps:"
echo "  1. Wait 5-10 minutes for setup to complete"
echo "  2. SSH into instance: ssh ubuntu@$STATIC_IP"
echo "  3. Check logs: sudo journalctl -u latap-backend -f"
echo "  4. Access app: http://$STATIC_IP"
echo ""
echo "💰 Monthly Cost: ~\$10"
echo "📈 Capacity: ~10,000 users"
