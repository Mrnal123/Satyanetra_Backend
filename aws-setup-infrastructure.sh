#!/bin/bash

# AWS Infrastructure Setup Script for Satyanetra Backend
# This script creates the necessary AWS infrastructure for deployment

set -e

echo "🚀 Setting up AWS infrastructure for Satyanetra Backend..."

# Configuration
AWS_REGION="us-east-1"
APP_NAME="satyanetra-backend"
ENV_NAME="production"
VPC_CIDR="10.0.0.0/16"
PUBLIC_SUBNET_1_CIDR="10.0.1.0/24"
PUBLIC_SUBNET_2_CIDR="10.0.2.0/24"
PRIVATE_SUBNET_1_CIDR="10.0.3.0/24"
PRIVATE_SUBNET_2_CIDR="10.0.4.0/24"

echo "📍 Configuration:"
echo "  Region: $AWS_REGION"
echo "  App Name: $APP_NAME"
echo "  Environment: $ENV_NAME"

# Function to check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI is not installed. Please install it first."
        exit 1
    fi
    echo "✅ AWS CLI found"
}

# Function to check if user is authenticated
check_aws_auth() {
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ Not authenticated with AWS. Please run 'aws configure' first."
        exit 1
    fi
    echo "✅ AWS authentication successful"
}

# Create VPC and networking
create_vpc() {
    echo "🏗️  Creating VPC and networking..."
    
    # Create VPC
    VPC_ID=$(aws ec2 create-vpc --cidr-block $VPC_CIDR --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$APP_NAME-vpc},{Key=Environment,Value=$ENV_NAME}]" --query 'Vpc.VpcId' --output text)
    echo "  VPC created: $VPC_ID"
    
    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$APP_NAME-igw}]" --query 'InternetGateway.InternetGatewayId' --output text)
    aws ec2 attach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID
    echo "  Internet Gateway created: $IGW_ID"
    
    # Create subnets
    AVAILABILITY_ZONES=$(aws ec2 describe-availability-zones --region $AWS_REGION --query 'AvailabilityZones[0:2].ZoneName' --output text)
    read -r ZONE1 ZONE2 <<< $AVAILABILITY_ZONES
    
    # Public subnets
    PUBLIC_SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_1_CIDR --availability-zone $ZONE1 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-1}]" --query 'Subnet.SubnetId' --output text)
    PUBLIC_SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PUBLIC_SUBNET_2_CIDR --availability-zone $ZONE2 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-2}]" --query 'Subnet.SubnetId' --output text)
    
    # Private subnets
    PRIVATE_SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PRIVATE_SUBNET_1_CIDR --availability-zone $ZONE1 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-1}]" --query 'Subnet.SubnetId' --output text)
    PRIVATE_SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block $PRIVATE_SUBNET_2_CIDR --availability-zone $ZONE2 --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-2}]" --query 'Subnet.SubnetId' --output text)
    
    echo "  Public Subnets: $PUBLIC_SUBNET_1, $PUBLIC_SUBNET_2"
    echo "  Private Subnets: $PRIVATE_SUBNET_1, $PRIVATE_SUBNET_2"
    
    # Create NAT Gateways
    NAT_EIP_1=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
    NAT_EIP_2=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
    
    NAT_GW_1=$(aws ec2 create-nat-gateway --subnet-id $PUBLIC_SUBNET_1 --allocation-id $NAT_EIP_1 --query 'NatGateway.NatGatewayId' --output text)
    NAT_GW_2=$(aws ec2 create-nat-gateway --subnet-id $PUBLIC_SUBNET_2 --allocation-id $NAT_EIP_2 --query 'NatGateway.NatGatewayId' --output text)
    
    echo "  NAT Gateways created: $NAT_GW_1, $NAT_GW_2"
    
    # Create route tables
    PUBLIC_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-public-rt}]" --query 'RouteTable.RouteTableId' --output text)
    PRIVATE_RT_1=$(aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-private-rt-1}]" --query 'RouteTable.RouteTableId' --output text)
    PRIVATE_RT_2=$(aws ec2 create-route-table --vpc-id $VPC_ID --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-private-rt-2}]" --query 'RouteTable.RouteTableId' --output text)
    
    # Add routes
    aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
    aws ec2 create-route --route-table-id $PRIVATE_RT_1 --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW_1
    aws ec2 create-route --route-table-id $PRIVATE_RT_2 --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW_2
    
    # Associate route tables
    aws ec2 associate-route-table --route-table-id $PUBLIC_RT --subnet-id $PUBLIC_SUBNET_1
    aws ec2 associate-route-table --route-table-id $PUBLIC_RT --subnet-id $PUBLIC_SUBNET_2
    aws ec2 associate-route-table --route-table-id $PRIVATE_RT_1 --subnet-id $PRIVATE_SUBNET_1
    aws ec2 associate-route-table --route-table-id $PRIVATE_RT_2 --subnet-id $PRIVATE_SUBNET_2
    
    echo "  Route tables created and associated"
}

# Create security groups
create_security_groups() {
    echo "🔒 Creating security groups..."
    
    # ALB Security Group
    ALB_SG=$(aws ec2 create-security-group --group-name $APP_NAME-alb-sg --description "ALB security group for $APP_NAME" --vpc-id $VPC_ID --query 'GroupId' --output text)
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
    echo "  ALB Security Group: $ALB_SG"
    
    # Application Security Group
    APP_SG=$(aws ec2 create-security-group --group-name $APP_NAME-app-sg --description "Application security group for $APP_NAME" --vpc-id $VPC_ID --query 'GroupId' --output text)
    aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 5000 --source-group $ALB_SG
    aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 22 --cidr 0.0.0.0/0  # For debugging (restrict in production)
    echo "  Application Security Group: $APP_SG"
    
    # Database Security Group
    DB_SG=$(aws ec2 create-security-group --group-name $APP_NAME-db-sg --description "Database security group for $APP_NAME" --vpc-id $VPC_ID --query 'GroupId' --output text)
    aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 5432 --source-group $APP_SG
    echo "  Database Security Group: $DB_SG"
}

# Create RDS database
create_database() {
    echo "🗄️  Creating RDS database..."
    
    # Create DB subnet group
    aws rds create-db-subnet-group \
        --db-subnet-group-name $APP_NAME-db-subnet-group \
        --db-subnet-group-description "Subnet group for $APP_NAME database" \
        --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2
    
    # Create parameter group
    aws rds create-db-parameter-group \
        --db-parameter-group-name $APP_NAME-db-params \
        --db-parameter-group-family postgres15 \
        --description "Parameter group for $APP_NAME database"
    
    # Create database instance
    DB_INSTANCE=$(aws rds create-db-instance \
        --db-instance-identifier $APP_NAME-db \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.4 \
        --master-username postgres \
        --master-user-password $(openssl rand -base64 32) \
        --allocated-storage 20 \
        --db-subnet-group-name $APP_NAME-db-subnet-group \
        --vpc-security-group-ids $DB_SG \
        --db-parameter-group-name $APP_NAME-db-params \
        --backup-retention-period 7 \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "sun:04:00-sun:05:00" \
        --multi-az false \
        --storage-encrypted \
        --enable-cloudwatch-logs-exports postgresql \
        --deletion-protection false \
        --query 'DBInstance.DBInstanceIdentifier' --output text)
    
    echo "  Database created: $DB_INSTANCE"
    echo "  Database endpoint will be available in a few minutes..."
}

# Create Application Load Balancer
create_load_balancer() {
    echo "⚖️  Creating Application Load Balancer..."
    
    # Create ALB
    ALB_ARN=$(aws elbv2 create-load-balancer \
        --name $APP_NAME-alb \
        --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
        --security-groups $ALB_SG \
        --scheme internet-facing \
        --type application \
        --ip-address-type ipv4 \
        --query 'LoadBalancers[0].LoadBalancerArn' --output text)
    
    echo "  Load Balancer created: $ALB_ARN"
    
    # Create target group
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
        --name $APP_NAME-targets \
        --protocol HTTP \
        --port 5000 \
        --vpc-id $VPC_ID \
        --health-check-protocol HTTP \
        --health-check-port 5000 \
        --health-check-path /health \
        --health-check-interval-seconds 30 \
        --health-check-timeout-seconds 5 \
        --healthy-threshold-count 2 \
        --unhealthy-threshold-count 3 \
        --query 'TargetGroups[0].TargetGroupArn' --output text)
    
    echo "  Target Group created: $TARGET_GROUP_ARN"
    
    # Create listener
    LISTENER_ARN=$(aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
        --query 'Listeners[0].ListenerArn' --output text)
    
    echo "  Listener created: $LISTENER_ARN"
}

# Create S3 bucket for application deployment
create_s3_bucket() {
    echo "🪣 Creating S3 bucket for deployments..."
    
    BUCKET_NAME="$APP_NAME-deployments-$(date +%s)"
    aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket $BUCKET_NAME --versioning-configuration Status=Enabled
    
    # Add lifecycle policy
    cat > lifecycle-policy.json << EOF
{
    "Rules": [
        {
            "ID": "Delete old versions",
            "Status": "Enabled",
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            }
        }
    ]
}
EOF
    
    aws s3api put-bucket-lifecycle-configuration --bucket $BUCKET_NAME --lifecycle-configuration file://lifecycle-policy.json
    rm lifecycle-policy.json
    
    echo "  S3 bucket created: $BUCKET_NAME"
}

# Save configuration to file
save_configuration() {
    echo "💾 Saving configuration..."
    
    cat > aws-infrastructure-config.json << EOF
{
    "application_name": "$APP_NAME",
    "environment": "$ENV_NAME",
    "region": "$AWS_REGION",
    "vpc_id": "$VPC_ID",
    "public_subnets": ["$PUBLIC_SUBNET_1", "$PUBLIC_SUBNET_2"],
    "private_subnets": ["$PRIVATE_SUBNET_1", "$PRIVATE_SUBNET_2"],
    "alb_security_group": "$ALB_SG",
    "app_security_group": "$APP_SG",
    "db_security_group": "$DB_SG",
    "load_balancer_arn": "$ALB_ARN",
    "target_group_arn": "$TARGET_GROUP_ARN",
    "database_instance": "$DB_INSTANCE",
    "deployment_bucket": "$BUCKET_NAME",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    echo "  Configuration saved to aws-infrastructure-config.json"
}

# Main execution
main() {
    echo "🚀 Starting AWS infrastructure setup for $APP_NAME..."
    
    check_aws_cli
    check_aws_auth
    
    create_vpc
    create_security_groups
    create_database
    create_load_balancer
    create_s3_bucket
    save_configuration
    
    echo "✅ Infrastructure setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Wait for database to be available (5-10 minutes)"
    echo "  2. Deploy your application using Elastic Beanstalk or ECS"
    echo "  3. Configure SSL certificate using AWS Certificate Manager"
    echo "  4. Set up monitoring and alerts"
    echo ""
    echo "🔑 Important: Check aws-infrastructure-config.json for all resource IDs"
    echo "📖 See AWS_DEPLOYMENT_GUIDE.md for application deployment instructions"
}

# Run main function
main "$@"