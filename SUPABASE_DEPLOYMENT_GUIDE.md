# 🚀 Deploying Satyanetra Backend to Supabase

This guide will help you deploy your Spring Boot application to Supabase with PostgreSQL database.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **GitHub Account**: For connecting your repository
3. **Your Project**: This Spring Boot backend application

## 🔧 Step-by-Step Deployment Guide

### Step 1: Set Up Supabase Project

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name (e.g., "satyanetra-backend")
   - Set a strong database password
   - Select region closest to your users
   - Wait for project creation (2-3 minutes)

2. **Get Database Connection Details**:
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Copy the **URI** connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

### Step 2: Configure Environment Variables

You need to set these environment variables in your deployment platform:

```bash
# Required - Replace with your actual values
SUPABASE_DB_URL=jdbc:postgresql://db.[PROJECT-ID].supabase.co:5432/postgres
SUPABASE_DB_USERNAME=postgres
SUPABASE_DB_PASSWORD=[YOUR-DATABASE-PASSWORD]

# Optional - Customize as needed
FRONTEND_ORIGIN=https://satyanetra.vercel.app
RATE_LIMIT_PER_MIN=3
DEFAULT_TIMEOUT=60
WEBHOOK_IFTTT_EVENT=satyanetra_analysis_complete
WEBHOOK_IFTTT_KEY=your-ifttt-key
WEBHOOK_IFTTT_ENABLED=true
```

### Step 3: Deployment Options

#### Option A: Deploy to Railway (Recommended - Easiest)

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Click "Deploy from GitHub"

2. **Configure Environment Variables**:
   - Go to **Variables** tab
   - Add all the environment variables from Step 2
   - Set `SPRING_PROFILES_ACTIVE=supabase`

3. **Deploy**:
   - Railway will automatically build and deploy
   - Your app will be available at `https://[app-name].up.railway.app`

#### Option B: Deploy to Render

1. **Update render.yaml**:
```yaml
services:
  - type: web
    name: satyanetra-backend-supabase
    runtime: docker
    plan: free
    region: singapore
    branch: main
    healthCheckPath: /health
    autoDeploy: true
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: supabase
      - key: SUPABASE_DB_URL
        value: jdbc:postgresql://db.[PROJECT-ID].supabase.co:5432/postgres
      - key: SUPABASE_DB_USERNAME
        value: postgres
      - key: SUPABASE_DB_PASSWORD
        value: [YOUR-DATABASE-PASSWORD]
      - key: FRONTEND_ORIGIN
        value: https://satyanetra.vercel.app
      - key: RATE_LIMIT_PER_MIN
        value: 3
      - key: DEFAULT_TIMEOUT
        value: 60
```

2. **Deploy to Render**:
   - Push changes to GitHub
   - Connect repository to Render
   - Deploy automatically

#### Option C: Deploy to Supabase Edge Functions (Advanced)

For serverless deployment, you'd need to refactor to use:
- Supabase Edge Functions (Deno/TypeScript)
- Or use Supabase as database only with another hosting service

### Step 4: Database Migration

Your Flyway migrations will automatically run on startup:
- `V0__create_tables.sql` - Creates initial tables
- `V1__add_constraints.sql` - Adds constraints
- `V2__add_product_image_url.sql` - Adds image URL column
- `V3__add_job_status.sql` - Adds job status
- `V4__add_job_logs.sql` - Creates job logs table
- `V5__add_job_logs_timestamp.sql` - Fixes timestamp column

### Step 5: Verify Deployment

1. **Health Check**:
   ```bash
   curl https://[your-domain]/health
   ```

2. **Test API**:
   ```bash
   # Test product ingestion
   curl -X POST https://[your-domain]/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com/product", "name": "Test Product"}'
   ```

3. **Check Database**:
   - Go to Supabase Dashboard
   - Navigate to **SQL Editor**
   - Run: `SELECT * FROM products;`

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Verify `SUPABASE_DB_URL` format
   - Check if IP is whitelisted in Supabase
   - Ensure password is correct

2. **Flyway Migration Errors**:
   - Check Supabase SQL Editor for existing tables
   - Manually run migrations if needed
   - Ensure user has CREATE permissions

3. **Port Binding Issues**:
   - Ensure `PORT` environment variable is set
   - Check if port 10000 is available

4. **CORS Issues**:
   - Verify `FRONTEND_ORIGIN` matches your frontend URL
   - Check if frontend is making requests to correct domain

### Debug Commands:
```bash
# Check logs
docker logs [container-id]

# Test database connection
psql $SUPABASE_DB_URL

# Check application logs
SPRING_PROFILES_ACTIVE=supabase java -jar app.jar
```

## 🎯 Next Steps

1. **Set up custom domain** (if needed)
2. **Configure SSL/TLS certificates**
3. **Set up monitoring and alerts**
4. **Configure backup strategy**
5. **Optimize database performance**

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Spring Boot Deployment Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

## 🆘 Support

If you encounter issues:
1. Check application logs
2. Verify environment variables
3. Test database connection
4. Review this guide
5. Ask for help in relevant communities

---

**Happy Deploying! 🚀** Your Satyanetra backend should now be running smoothly on Supabase!