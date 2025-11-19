# Deployment Guide - Cognitive Canvas

This guide covers multiple deployment options for the Cognitive Canvas application.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ Completed all phases (1-4) of development
2. ✅ Tested the application locally
3. ✅ An Anthropic API key
4. ✅ A PostgreSQL database (or database provider)
5. ✅ Environment variables configured

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended for Self-Hosting)

**Best for**: Complete control, running on your own server

#### Steps:

1. **Copy environment file**:
```bash
cp .env.docker.example .env
```

2. **Edit .env with your values**:
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_minimum_32_chars
ANTHROPIC_API_KEY=sk-ant-...
```

3. **Build and start containers**:
```bash
docker-compose up -d
```

4. **Run database migrations**:
```bash
docker-compose exec backend npx prisma migrate deploy
```

5. **Access the application**:
- Frontend: http://localhost
- Backend: http://localhost:3000
- Database: localhost:5432

6. **View logs**:
```bash
docker-compose logs -f
```

7. **Stop containers**:
```bash
docker-compose down
```

---

### Option 2: Railway (Easiest Full-Stack Deploy)

**Best for**: Quick deployment, managed infrastructure

#### Steps:

1. **Create Railway account**: https://railway.app

2. **Install Railway CLI**:
```bash
npm install -g @railway/cli
railway login
```

3. **Initialize project**:
```bash
railway init
```

4. **Add PostgreSQL database**:
- Go to Railway dashboard
- Click "New" → "Database" → "PostgreSQL"
- Copy the `DATABASE_URL` provided

5. **Deploy backend**:
```bash
cd backend
railway up
```

6. **Set environment variables** in Railway dashboard:
```
DATABASE_URL=(from Railway PostgreSQL)
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_api_key
NODE_ENV=production
```

7. **Run migrations**:
```bash
railway run npx prisma migrate deploy
```

8. **Deploy frontend**:
```bash
cd frontend
railway up
```

9. **Set frontend environment**:
```
VITE_API_URL=https://your-backend.railway.app
```

**Estimated Cost**: $5-20/month (with usage)

---

### Option 3: Vercel (Frontend) + Railway (Backend)

**Best for**: Optimized frontend performance

#### Backend on Railway:
1. Follow Railway steps above for backend only

#### Frontend on Vercel:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd frontend
vercel
```

3. **Set environment variables** in Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app
```

4. **Production deployment**:
```bash
vercel --prod
```

**Estimated Cost**: Frontend free, Backend $5-20/month

---

### Option 4: AWS (Production-Grade)

**Best for**: Enterprise applications, scalability

#### Architecture:
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate or EC2
- **Database**: RDS PostgreSQL
- **Load Balancer**: Application Load Balancer

#### Steps:

1. **Create RDS PostgreSQL instance**:
```bash
aws rds create-db-instance \
  --db-instance-identifier cognitive-canvas-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

2. **Build and push Docker images to ECR**:
```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build
docker build -t cognitive-canvas-backend ./backend
docker build -t cognitive-canvas-frontend ./frontend

# Tag
docker tag cognitive-canvas-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/cognitive-canvas-backend:latest
docker tag cognitive-canvas-frontend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/cognitive-canvas-frontend:latest

# Push
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/cognitive-canvas-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/cognitive-canvas-frontend:latest
```

3. **Create ECS task definitions and services**

4. **Deploy frontend to S3 + CloudFront**:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Estimated Cost**: $30-100+/month

---

### Option 5: DigitalOcean App Platform

**Best for**: Balance of simplicity and control

#### Steps:

1. **Create DigitalOcean account**: https://digitalocean.com

2. **Create PostgreSQL database**:
- Go to "Databases" → "Create Database"
- Choose PostgreSQL 15
- Note the connection string

3. **Create App**:
- Go to "Apps" → "Create App"
- Connect your GitHub repository
- Detect both backend and frontend

4. **Configure backend**:
- Build command: `npm install && npm run build`
- Run command: `npm run start:prod`
- Environment variables:
  ```
  DATABASE_URL=(from DO database)
  JWT_SECRET=your_secret
  ANTHROPIC_API_KEY=your_key
  NODE_ENV=production
  ```

5. **Configure frontend**:
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment variables:
  ```
  VITE_API_URL=https://your-backend.ondigitalocean.app
  ```

6. **Run migrations** via console:
```bash
npx prisma migrate deploy
```

**Estimated Cost**: $12-30/month

---

## 🔧 Post-Deployment Configuration

### 1. Database Setup

After first deployment, run migrations:

```bash
# Docker
docker-compose exec backend npx prisma migrate deploy

# Railway
railway run npx prisma migrate deploy

# SSH into server
ssh user@your-server
cd /path/to/app
npx prisma migrate deploy
```

### 2. Create Admin User

Use the API or database directly:

```bash
# Using curl
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass123","name":"Admin"}'
```

### 3. Verify Health

Check backend health:
```bash
curl https://your-api.com/health
```

Check frontend:
```bash
curl https://your-frontend.com
```

### 4. Monitor Logs

**Docker**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Railway**:
```bash
railway logs
```

**DigitalOcean**:
- Go to App → Runtime Logs

### 5. Set Up SSL/HTTPS

Most platforms (Railway, Vercel, DigitalOcean) provide automatic SSL.

For custom domains:
- Add domain in platform dashboard
- Update DNS records
- Platform handles SSL certificate

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Enable Helmet security headers
- [ ] Sanitize user inputs
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Review and remove debug logs
- [ ] Set NODE_ENV=production
- [ ] Rotate API keys regularly
- [ ] Implement database connection pooling
- [ ] Set up error tracking (e.g., Sentry)

---

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Logs**: Check application logs regularly
2. **Errors**: Set up error tracking (Sentry, Rollbar)
3. **Performance**: Monitor API response times
4. **Database**: Monitor connection pool, query performance

### Database Backups

**Automated Backups** (Railway/DO):
- Enable in platform dashboard
- Configure retention period

**Manual Backups**:
```bash
# Docker
docker-compose exec database pg_dump -U cognitive_user cognitive_canvas > backup.sql

# Restore
docker-compose exec -T database psql -U cognitive_user cognitive_canvas < backup.sql
```

### Updates & Migrations

1. **Test in staging** first
2. **Backup database** before migrations
3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
4. **Deploy new code**
5. **Verify health checks**

---

## 🐛 Troubleshooting

### Backend won't start

**Check**:
- DATABASE_URL is correct
- All environment variables are set
- Database is accessible
- Migrations are applied

**Logs**:
```bash
docker-compose logs backend
railway logs
```

### Frontend can't connect to backend

**Check**:
- VITE_API_URL is correct
- Backend is running
- CORS is configured for frontend domain
- Network/firewall allows connection

### Database connection errors

**Check**:
- Database is running
- Connection string format
- Firewall/security groups
- Connection pool settings

### Rate limiting issues

**Adjust** in `backend/src/middleware/security.middleware.ts`:
```typescript
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase limit
});
```

---

## 📈 Scaling Considerations

### For Growing Traffic:

1. **Database**:
   - Upgrade instance size
   - Enable connection pooling
   - Add read replicas

2. **Backend**:
   - Increase container count
   - Add load balancer
   - Implement caching (Redis)

3. **Frontend**:
   - Use CDN (CloudFront, Cloudflare)
   - Enable gzip compression
   - Optimize bundle size

4. **Costs**:
   - Monitor usage metrics
   - Set up billing alerts
   - Optimize expensive queries

---

## 💰 Cost Estimates

### Small Scale (< 100 users):
- **Railway/DigitalOcean**: $12-30/month
- **Vercel (Frontend) + Railway (Backend)**: $5-25/month
- **Docker on VPS**: $5-15/month (+ domain)

### Medium Scale (100-1000 users):
- **Railway/DigitalOcean**: $30-100/month
- **AWS**: $50-150/month
- **Includes**: Larger database, multiple instances

### Large Scale (1000+ users):
- **AWS/GCP**: $200+/month
- **Includes**: Auto-scaling, load balancers, CDN, monitoring

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [DigitalOcean Docs](https://docs.digitalocean.com)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🎉 Success!

Once deployed, your Cognitive Canvas application will be accessible to users worldwide. Remember to:

1. Monitor logs and errors
2. Keep dependencies updated
3. Backup database regularly
4. Respond to security advisories
5. Scale as needed

Happy deploying! 🚀
