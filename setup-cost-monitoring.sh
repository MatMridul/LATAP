#!/bin/bash

# AWS Cost Monitoring and Alerting Setup
# Sets up billing alerts and cost tracking

set -e

echo "💰 Setting up AWS Cost Monitoring"
echo "=================================="
echo ""

# Create SNS topic for billing alerts
echo "1️⃣  Creating SNS topic for alerts..."
TOPIC_ARN=$(aws sns create-topic \
  --name latap-billing-alerts \
  --query 'TopicArn' \
  --output text)

echo "✅ Topic created: $TOPIC_ARN"
echo ""

# Subscribe email to topic
read -p "Enter email for billing alerts: " EMAIL
aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol email \
  --notification-endpoint $EMAIL

echo "✅ Subscription created (check email to confirm)"
echo ""

# Create CloudWatch alarms for billing
echo "2️⃣  Creating billing alarms..."

# $20 threshold
aws cloudwatch put-metric-alarm \
  --alarm-name latap-billing-20 \
  --alarm-description "Alert when estimated charges exceed $20" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 20 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN \
  --dimensions Name=Currency,Value=USD

echo "✅ $20 threshold alarm created"

# $40 threshold
aws cloudwatch put-metric-alarm \
  --alarm-name latap-billing-40 \
  --alarm-description "Alert when estimated charges exceed $40" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 40 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN \
  --dimensions Name=Currency,Value=USD

echo "✅ $40 threshold alarm created"

# $60 threshold
aws cloudwatch put-metric-alarm \
  --alarm-name latap-billing-60 \
  --alarm-description "Alert when estimated charges exceed $60" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 60 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN \
  --dimensions Name=Currency,Value=USD

echo "✅ $60 threshold alarm created"
echo ""

# Create budget
echo "3️⃣  Creating AWS Budget..."
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://<(cat <<EOF
{
  "BudgetName": "latap-monthly-budget",
  "BudgetLimit": {
    "Amount": "50",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  }
}
EOF
) \
  --notifications-with-subscribers file://<(cat <<EOF
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "$EMAIL"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "FORECASTED",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "$EMAIL"
      }
    ]
  }
]
EOF
)

echo "✅ Budget created: $50/month with 80% alert"
echo ""

echo "=================================="
echo "✅ Cost Monitoring Setup Complete!"
echo "=================================="
echo ""
echo "📊 Configured Alerts:"
echo "  - Email: $EMAIL"
echo "  - Billing: $20, $40, $60 thresholds"
echo "  - Budget: $50/month (80% warning)"
echo ""
echo "📝 Next Steps:"
echo "  1. Confirm email subscription"
echo "  2. Enable Cost Explorer in AWS Console"
echo "  3. Review costs weekly"
echo "  4. Adjust budgets as needed"
