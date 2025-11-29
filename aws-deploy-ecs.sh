#!/bin/bash

# AWS ECS Fargate Deployment Script for Satyanetra Backend
# This script sets up ECS Fargate infrastructure and deploys the application

set -e

# Configuration
REGION="us-east-1"
CLUSTER_NAME="satyanetra-cluster"
SERVICE_NAME="satyanetra-backend"
TASK_DEFINITION_NAME="satyanetra-task"
CONTAINER_NAME="satyanetra-container"
IMAGE_NAME="satyanetra-backend"
LOG_GROUP_NAME="/ecs/satyanetra"
TARGET_GROUP_NAME="satyanetra-tg"
LOAD_BALANCER_NAME="satyanetra-alb"
SECURITY_GROUP_NAME="satyanetra-sg"
VPC_NAME="satyanetra-vpc"
SUBNET_TAG="satyanetra-subnet"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS ECS Fargate deployment...${NC}"

# Function to check if AWS CLI is configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi
}

# Function to create VPC and networking
create_vpc() {
    echo -e "${YELLOW}📋 Creating VPC and networking...${NC}"
    
    # Create VPC
    VPC_ID=$(aws ec2 create-vpc \
        --cidr-block 10.0.0.0/16 \
        --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
        --query 'Vpc.VpcId' \
        --output text \
        --region $REGION)
    
    echo "VPC ID: $VPC_ID"
    
    # Create Internet Gateway
    IGW_ID=$(aws ec2 create-internet-gateway \
        --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$VPC_NAME-igw}]" \
        --query 'InternetGateway.InternetGatewayId' \
        --output text \
        --region $REGION)
    
    aws ec2 attach-internet-gateway \
        --vpc-id $VPC_ID \
        --internet-gateway-id $IGW_ID \
        --region $REGION
    
    # Create public subnets
    SUBNET_1_ID=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.1.0/24 \
        --availability-zone ${REGION}a \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$SUBNET_TAG-public-1}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION)
    
    SUBNET_2_ID=$(aws ec2 create-subnet \
        --vpc-id $VPC_ID \
        --cidr-block 10.0.2.0/24 \
        --availability-zone ${REGION}b \
        --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$SUBNET_TAG-public-2}]" \
        --query 'Subnet.SubnetId' \
        --output text \
        --region $REGION)
    
    echo "Public Subnets: $SUBNET_1_ID, $SUBNET_2_ID"
    
    # Create route table
    ROUTE_TABLE_ID=$(aws ec2 create-route-table \
        --vpc-id $VPC_ID \
        --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$VPC_NAME-rt}]" \
        --query 'RouteTable.RouteTableId' \
        --output text \
        --region $REGION)
    
    aws ec2 create-route \
        --route-table-id $ROUTE_TABLE_ID \
        --destination-cidr-block 0.0.0.0/0 \
        --gateway-id $IGW_ID \
        --region $REGION
    
    aws ec2 associate-route-table \
        --subnet-id $SUBNET_1_ID \
        --route-table-id $ROUTE_TABLE_ID \
        --region $REGION
    
    aws ec2 associate-route-table \
        --subnet-id $SUBNET_2_ID \
        --route-table-id $ROUTE_TABLE_ID \
        --region $REGION
}

# Function to create security group
create_security_group() {
    echo -e "${YELLOW}🔒 Creating security group...${NC}"
    
    SECURITY_GROUP_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Satyanetra Backend" \
        --vpc-id $VPC_ID \
        --query 'GroupId' \
        --output text \
        --region $REGION)
    
    # Allow inbound traffic on port 8080
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 8080 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    # Allow inbound traffic on port 80
    aws ec2 authorize-security-group-ingress \
        --group-id $SECURITY_GROUP_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    echo "Security Group ID: $SECURITY_GROUP_ID"
}

# Function to create ECS cluster
create_ecs_cluster() {
    echo -e "${YELLOW}🎯 Creating ECS cluster...${NC}"
    
    aws ecs create-cluster \
        --cluster-name $CLUSTER_NAME \
        --region $REGION \
        --capacity-providers FARGATE FARGATE_SPOT \
        --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
        --settings name=containerInsights,value=enabled
}

# Function to create CloudWatch log group
create_log_group() {
    echo -e "${YELLOW}📝 Creating CloudWatch log group...${NC}"
    
    aws logs create-log-group \
        --log-group-name $LOG_GROUP_NAME \
        --region $REGION
}

# Function to create task definition
create_task_definition() {
    echo -e "${YELLOW}📦 Creating task definition...${NC}"
    
    # Get RDS endpoint (assuming it exists)
    RDS_ENDPOINT=""
    if aws rds describe-db-instances --db-instance-identifier satyanetra-db --region $REGION &> /dev/null; then
        RDS_ENDPOINT=$(aws rds describe-db-instances \
            --db-instance-identifier satyanetra-db \
            --query 'DBInstances[0].Endpoint.Address' \
            --output text \
            --region $REGION)
    fi
    
    cat > task-definition.json << EOF
{
    "family": "$TASK_DEFINITION_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "512",
    "memory": "1024",
    "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
    "taskRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "$CONTAINER_NAME",
            "image": "$IMAGE_NAME:latest",
            "portMappings": [
                {
                    "containerPort": 8080,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {
                    "name": "SPRING_PROFILES_ACTIVE",
                    "value": "aws"
                },
                {
                    "name": "SERVER_PORT",
                    "value": "8080"
                },
                {
                    "name": "SPRING_DATASOURCE_URL",
                    "value": "jdbc:postgresql://$RDS_ENDPOINT:5432/satyanetra"
                },
                {
                    "name": "SPRING_DATASOURCE_USERNAME",
                    "value": "satyanetra"
                },
                {
                    "name": "SPRING_DATASOURCE_PASSWORD",
                    "value": "your-password-here"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "$LOG_GROUP_NAME",
                    "awslogs-region": "$REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 60
            }
        }
    ]
}
EOF
    
    aws ecs register-task-definition \
        --cli-input-json file://task-definition.json \
        --region $REGION
}

# Function to create Application Load Balancer
create_load_balancer() {
    echo -e "${YELLOW}⚖️  Creating Application Load Balancer...${NC}"
    
    # Create load balancer
    LOAD_BALANCER_ARN=$(aws elbv2 create-load-balancer \
        --name $LOAD_BALANCER_NAME \
        --subnets $SUBNET_1_ID $SUBNET_2_ID \
        --security-groups $SECURITY_GROUP_ID \
        --scheme internet-facing \
        --type application \
        --ip-address-type ipv4 \
        --query 'LoadBalancers[0].LoadBalancerArn' \
        --output text \
        --region $REGION)
    
    echo "Load Balancer ARN: $LOAD_BALANCER_ARN"
    
    # Create target group
    TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
        --name $TARGET_GROUP_NAME \
        --protocol HTTP \
        --port 8080 \
        --vpc-id $VPC_ID \
        --target-type ip \
        --health-check-protocol HTTP \
        --health-check-path "/health" \
        --health-check-interval-seconds 30 \
        --health-check-timeout-seconds 5 \
        --healthy-threshold-count 2 \
        --unhealthy-threshold-count 3 \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text \
        --region $REGION)
    
    echo "Target Group ARN: $TARGET_GROUP_ARN"
    
    # Create listener
    aws elbv2 create-listener \
        --load-balancer-arn $LOAD_BALANCER_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=forward,TargetGroupArn=$TARGET_GROUP_ARN \
        --region $REGION
}

# Function to create ECS service
create_ecs_service() {
    echo -e "${YELLOW}🚀 Creating ECS service...${NC}"
    
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVICE_NAME \
        --task-definition $TASK_DEFINITION_NAME \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_1_ID,$SUBNET_2_ID],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
        --load-balancers targetGroupArn=$TARGET_GROUP_ARN,containerName=$CONTAINER_NAME,containerPort=8080 \
        --region $REGION
}

# Function to build and push Docker image
build_and_push_image() {
    echo -e "${YELLOW}🐳 Building and pushing Docker image...${NC}"
    
    # Get ECR login token
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com
    
    # Create ECR repository if it doesn't exist
    aws ecr create-repository \
        --repository-name $IMAGE_NAME \
        --region $REGION || true
    
    # Build Docker image
    docker build -f Dockerfile.aws -t $IMAGE_NAME:latest .
    
    # Tag image for ECR
    docker tag $IMAGE_NAME:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME:latest
    
    # Push image to ECR
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com/$IMAGE_NAME:latest
}

# Main deployment function
main() {
    check_aws_cli
    
    echo -e "${GREEN}🚀 Starting full ECS Fargate deployment...${NC}"
    
    # Create VPC and networking
    create_vpc
    
    # Create security group
    create_security_group
    
    # Create ECS cluster
    create_ecs_cluster
    
    # Create CloudWatch log group
    create_log_group
    
    # Build and push Docker image
    build_and_push_image
    
    # Create task definition
    create_task_definition
    
    # Create load balancer
    create_load_balancer
    
    # Create ECS service
    create_ecs_service
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo "Load Balancer DNS: $(aws elbv2 describe-load-balancers --load-balancer-arns $LOAD_BALANCER_ARN --query 'LoadBalancers[0].DNSName' --output text --region $REGION)"
}

# Run main function
main "$@"