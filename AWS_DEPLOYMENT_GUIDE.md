# AWS Deployment Configuration

## Environment Variables for Production

### Core Application
```bash
NODE_ENV=production
APP_VERSION=1.0.0
PORT=3001
LOG_LEVEL=info
```

### Database (RDS)
```bash
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/latap
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECT_TIMEOUT=5000
DB_STATEMENT_TIMEOUT=30000
DB_QUERY_TIMEOUT=30000
RDS_CA_CERT=<RDS CA certificate>
```

### Redis (ElastiCache)
```bash
REDIS_HOST=elasticache-endpoint
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>
REDIS_DB=0
REDIS_CLUSTER=false
```

### AWS Services
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<not-needed-with-iam-role>
AWS_SECRET_ACCESS_KEY=<not-needed-with-iam-role>
```

### S3
```bash
S3_BUCKET=latap-documents-prod
```

### SES
```bash
FROM_EMAIL=noreply@latap.com
FRONTEND_URL=https://latap.com
```

### CloudWatch
```bash
AWS_CLOUDWATCH_GROUP=/aws/ecs/latap-backend
AWS_ECS_TASK_ID=<auto-populated-by-ecs>
```

### Security
```bash
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://latap.com
```

## AWS Services Required

### 1. ECS Fargate
- **Task Definition**: 0.5 vCPU, 1GB RAM (minimum)
- **Auto Scaling**: Target 70% CPU utilization
- **Service**: 2+ tasks for high availability

### 2. RDS PostgreSQL
- **Instance**: db.t3.medium (minimum)
- **Multi-AZ**: Enabled
- **Backup**: 7-day retention
- **Encryption**: At rest and in transit

### 3. ElastiCache Redis
- **Node**: cache.t3.micro (minimum)
- **Cluster Mode**: Disabled (single node for now)
- **Encryption**: In transit

### 4. S3
- **Bucket**: latap-documents-prod
- **Versioning**: Enabled
- **Encryption**: AES-256
- **Lifecycle**: Delete after 90 days (optional)

### 5. Application Load Balancer
- **Health Check**: /health/readiness
- **Target Group**: ECS tasks
- **SSL**: ACM certificate

### 6. CloudWatch
- **Log Groups**: /aws/ecs/latap-backend
- **Metrics**: Custom application metrics
- **Alarms**: CPU, memory, error rate

### 7. Secrets Manager
- Store: JWT_SECRET, DB_PASSWORD, REDIS_PASSWORD
- Rotation: Enabled for database credentials

### 8. IAM Roles
- **ECS Task Role**: S3, SES, Textract, CloudWatch access
- **ECS Execution Role**: ECR, CloudWatch Logs access

## Deployment Architecture

```
Internet
    ↓
Route 53 (DNS)
    ↓
CloudFront (CDN) → S3 (Frontend Static)
    ↓
ALB (Load Balancer)
    ↓
ECS Fargate (Backend Tasks)
    ↓
├── RDS PostgreSQL (Multi-AZ)
├── ElastiCache Redis
├── S3 (Document Storage)
└── CloudWatch (Logging/Monitoring)
```

## Cost Optimization

### Development Environment
- RDS: db.t3.micro
- ElastiCache: cache.t3.micro
- ECS: 1 task (0.25 vCPU, 0.5GB)
- **Estimated**: $50-80/month

### Production Environment
- RDS: db.t3.medium (Multi-AZ)
- ElastiCache: cache.t3.small
- ECS: 2-4 tasks (0.5 vCPU, 1GB each)
- S3: Pay per use
- **Estimated**: $200-300/month

## Scaling Strategy

### Horizontal Scaling
- ECS Auto Scaling based on CPU/Memory
- Target: 2-10 tasks
- Scale up: CPU > 70% for 2 minutes
- Scale down: CPU < 30% for 5 minutes

### Vertical Scaling
- Start with t3 instances
- Monitor and upgrade to t3.large/m5 if needed
- RDS read replicas for read-heavy workloads

### Database Connection Pooling
- Max connections per task: 20
- Total RDS connections: tasks × 20
- RDS max_connections: 100+ (adjust based on instance)

## Monitoring & Alerts

### CloudWatch Alarms
1. **High CPU**: > 80% for 5 minutes
2. **High Memory**: > 85% for 5 minutes
3. **Database Connections**: > 80% of max
4. **Error Rate**: > 5% of requests
5. **Response Time**: P95 > 1000ms

### Dashboards
- Request rate and latency
- Database query performance
- Redis hit/miss ratio
- S3 upload success rate
- Error logs and stack traces

## Security Checklist

- [ ] Enable VPC with private subnets
- [ ] Security groups: Least privilege
- [ ] RDS encryption at rest
- [ ] S3 bucket policies: Private only
- [ ] IAM roles: No access keys in code
- [ ] Secrets Manager for credentials
- [ ] CloudTrail for audit logging
- [ ] WAF for ALB (optional)
- [ ] GuardDuty for threat detection

## Deployment Process

### 1. Build Docker Image
```bash
docker build -t latap-backend:latest ./backend
docker tag latap-backend:latest <ecr-repo>:latest
docker push <ecr-repo>:latest
```

### 2. Update ECS Task Definition
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 3. Update ECS Service
```bash
aws ecs update-service \
  --cluster latap-cluster \
  --service latap-backend \
  --task-definition latap-backend:latest \
  --force-new-deployment
```

### 4. Monitor Deployment
```bash
aws ecs wait services-stable \
  --cluster latap-cluster \
  --services latap-backend
```

## Rollback Strategy

1. Keep previous 3 task definitions
2. Quick rollback: Update service to previous task definition
3. Database migrations: Use reversible migrations
4. Feature flags: Disable features without deployment

## Next Steps

1. Create AWS infrastructure with Terraform/CloudFormation
2. Set up CI/CD pipeline (GitHub Actions → ECR → ECS)
3. Configure monitoring and alerting
4. Load testing and performance tuning
5. Disaster recovery plan and backups
