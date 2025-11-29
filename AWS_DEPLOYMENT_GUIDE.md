# 🚀 Deploying Satyanetra Backend to AWS

This comprehensive guide will help you deploy your Spring Boot application to AWS using multiple approaches: Elastic Beanstalk (easiest), ECS (containerized), and EC2 (manual).

## 📋 Prerequisites

1. **AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI**: Install from [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
3. **Docker**: Install Docker Desktop
4. **Your Project**: This Spring Boot backend application

---

## 🎯 **Option 1: AWS Elastic Beanstalk (Recommended - Easiest)**

### Step 1: Prepare Your Application

1. **Build your application**:
   ```bash
   mvn clean package
   ```

2. **Create deployment package**:
   ```bash
   # Create ZIP file for Elastic Beanstalk
   zip -r satyanetra-backend.zip target/satyanetra-backend-0.1.0.jar .ebextensions/
   ```

### Step 2: Deploy via AWS Console

1. **Go to AWS Console** → **Elastic Beanstalk**
2. **Create Application**:
   - Application name: `satyanetra-backend`
   - Platform: `Java 17`
   - Upload your `satyanetra-backend.zip` file

3. **Configure Environment**:
   - Environment name: `satyanetra-backend-env`
   - Domain: Choose available subdomain
   - Platform version: Latest Java 17

4. **Set Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=aws
   AWS_DB_URL=jdbc:postgresql://[your-rds-endpoint]:5432/satyanetra
   AWS_DB_USERNAME=postgres
   AWS_DB_PASSWORD=[your-password]
   FRONTEND_ORIGIN=https://satyanetra.vercel.app
   RATE_LIMIT_PER_MIN=3
   DEFAULT_TIMEOUT=60
   ```

### Step 3: Set Up RDS Database

1. **Create RDS Instance**:
   - Go to **RDS** → **Create Database**
   - Engine: **PostgreSQL**
   - Template: **Free tier**
   - Instance: **db.t3.micro**
   - Database name: `satyanetra`
   - Master username: `postgres`
   - Master password: `[secure-password]`

2. **Configure Security Group**:
   - Create new security group
   - Add inbound rule: PostgreSQL (5432) from Elastic Beanstalk security group

---

## 🐳 **Option 2: AWS ECS with Fargate (Containerized)**

### Step 1: Build and Push Docker Image

1. **Build Docker image**:
   ```bash
   docker build -f Dockerfile.aws -t satyanetra-backend .
   ```

2. **Create ECR Repository**:
   ```bash
   aws ecr create-repository --repository-name satyanetra-backend
   ```

3. **Push to ECR**:
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [your-account].dkr.ecr.us-east-1.amazonaws.com
   
   # Tag and push
   docker tag satyanetra-backend:latest [your-account].dkr.ecr.us-east-1.amazonaws.com/satyanetra-backend:latest
   docker push [your-account].dkr.ecr.us-east-1.amazonaws.com/satyanetra-backend:latest
   ```

### Step 2: Create ECS Cluster

1. **Create Cluster**:
   - Go to **ECS** → **Clusters** → **Create Cluster**
   - Choose **Networking only** (Fargate)
   - Name: `satyanetra-cluster`

2. **Create Task Definition**:
   - Launch type: **Fargate**
   - Task memory: **0.5 GB**
   - Task CPU: **0.25 vCPU**
   - Container: Use your ECR image
   - Port mapping: **5000:5000**

3. **Create Service**:
   - Launch type: **Fargate**
   - Cluster: `satyanetra-cluster`
   - Task definition: Your created task
   - Service name: `satyanetra-service`
   - Number of tasks: **2** (for high availability)

---

## 🔧 **Option 3: AWS EC2 (Manual Setup)**

### Step 1: Launch EC2 Instance

1. **Create EC2 Instance**:
   - AMI: **Amazon Linux 2**
   - Instance type: **t2.micro** (free tier)
   - Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (app)
   - Key pair: Create/download for SSH access

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Java and Docker**:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install java-openjdk17 -y
   sudo yum install docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```

### Step 2: Deploy Application

1. **Copy application to EC2**:
   ```bash
   scp -i your-key.pem target/satyanetra-backend-0.1.0.jar ec2-user@your-instance-ip:/home/ec2-user/
   ```

2. **Run application**:
   ```bash
   java -Dspring.profiles.active=aws -jar satyanetra-backend-0.1.0.jar
   ```

---

## 🗄️ **Database Setup (All Options)**

### RDS Configuration

1. **Create RDS Subnet Group**:
   - Go to **RDS** → **Subnet Groups** → **Create**
   - Choose VPC and subnets (at least 2 availability zones)

2. **Database Security**:
   - Use **Parameter Groups** to optimize PostgreSQL settings
   - Enable **Encryption at rest**
   - Set up **Automated backups**
   - Configure **Multi-AZ** for production

3. **Connection String Format**:
   ```
   jdbc:postgresql://[endpoint]:5432/satyanetra
   ```

---

## 🔒 **Security Best Practices**

### 1. **IAM Roles**
```bash
# Create EC2 role for S3 access (if needed)
aws iam create-role --role-name satyanetra-ec2-role --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy --role-name satyanetra-ec2-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

### 2. **Secrets Management**
```bash
# Store database password in Secrets Manager
aws secretsmanager create-secret --name satyanetra-db-password --secret-string "your-secure-password"

# Store in Parameter Store (alternative)
aws ssm put-parameter --name "/satyanetra/db-password" --value "your-secure-password" --type SecureString
```

### 3. **SSL/TLS Setup**
- Use **AWS Certificate Manager** for free SSL certificates
- Configure **Application Load Balancer** with HTTPS
- Redirect HTTP to HTTPS

---

## 📊 **Monitoring and Logging**

### CloudWatch Configuration

1. **Logs**:
   ```yaml
   # .ebextensions/04_cloudwatch.config
   files:
     "/opt/aws/amazon-cloudwatch-agent/bin/config.json":
       mode: "000600"
       owner: root
       group: root
       content: |
         {
           "logs": {
             "logs_collected": {
               "files": {
                 "collect_list": [
                   {
                     "file_path": "/var/log/eb-docker/containers/eb-current-app/*.log",
                     "log_group_name": "/aws/elasticbeanstalk/satyanetra-backend/app",
                     "log_stream_name": "{instance_id}"
                   }
                 ]
               }
             }
           }
         }
   ```

2. **Metrics**:
   - Set up **CloudWatch Alarms** for CPU, memory, and disk usage
   - Create **SNS topics** for notifications
   - Use **AWS X-Ray** for distributed tracing

---

## 🧪 **Testing Your Deployment**

### Health Check
```bash
curl https://your-domain/health
```

### API Testing
```bash
# Test product ingestion
curl -X POST https://your-domain/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/product", "name": "Test Product"}'
```

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test with 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://your-domain/health
```

---

## 💰 **Cost Optimization**

### Free Tier Eligible Services
- **EC2**: 750 hours/month (t2.micro)
- **RDS**: 750 hours/month (db.t2.micro)
- **S3**: 5GB storage
- **CloudWatch**: Basic monitoring

### Cost-Saving Tips
1. Use **Spot Instances** for non-critical workloads
2. Enable **Auto Scaling** to match demand
3. Use **S3 lifecycle policies** for log archival
4. Set up **billing alerts**

---

## 🚨 **Troubleshooting**

### Common Issues

1. **Database Connection Failed**:
   ```bash
   # Check security groups
   aws ec2 describe-security-groups --group-ids sg-xxxxxx
   
   # Test connection
   telnet your-rds-endpoint 5432
   ```

2. **Application Won't Start**:
   ```bash
   # Check logs
   sudo tail -f /var/log/tomcat8/catalina.out
   
   # Check environment variables
   printenv | grep SPRING
   ```

3. **Health Check Fails**:
   - Ensure `/health` endpoint is accessible
   - Check load balancer health check path
   - Verify security group rules

### Debug Commands
```bash
# View system logs
sudo journalctl -xe

# Check disk space
df -h

# Check memory usage
free -m

# Monitor processes
top
```

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions Example
```yaml
name: Deploy to AWS
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up JDK 17
      uses: actions/setup-java@v2
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Build with Maven
      run: mvn clean package
    
    - name: Deploy to Elastic Beanstalk
      uses: einaregilsson/beanstalk-deploy@v21
      with:
        aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        application_name: satyanetra-backend
        environment_name: satyanetra-backend-env
        version_label: ${{ github.sha }}
        region: us-east-1
        deployment_package: target/satyanetra-backend-0.1.0.jar
```

---

## 📚 **Additional Resources**

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elastic-beanstalk/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [AWS Best Practices](https://aws.amazon.com/architecture/)
- [AWS Pricing Calculator](https://calculator.aws/)

---

## 🆘 **Support**

If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify security group configurations
3. Test database connectivity
4. Review this guide
5. Check AWS Service Health Dashboard
6. Contact AWS Support (for paid plans)

---

**Happy Deploying! 🚀** Your Satyanetra backend is now ready for AWS deployment!