# Proshnobank Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup
Ensure all required environment variables are set in Vercel project settings:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://urtptlxotyyjfqynpbwx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Nsoq2imHt18oFlasZFWhWQ_JODNqJx-

# Stripe Configuration (Add after Stripe account setup)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
VITE_APP_URL=https://proshnobank.vercel.app
NODE_ENV=production
```

### 2. Database Migrations
Run all migrations on production database:

```bash
# Connect to production Supabase
psql postgresql://[user]:[password]@[host]/postgres

# Run migrations in order:
\i supabase/sql/full_project_setup.sql
\i supabase/migrations/20260424100000_doubt_system.sql
\i supabase/migrations/20260424110000_subscription_system.sql
```

### 3. Stripe Setup
1. Create Stripe account at stripe.com
2. Get API keys from Stripe Dashboard
3. Create subscription products:
   - Free Plan: $0/month
   - Basic Plan: $99/month or $999/year
   - Pro Plan: $299/month or $2999/year
   - Premium Plan: $999/month or $9999/year
4. Set up Stripe webhooks for payment events

### 4. OAuth Configuration (Google & Facebook)

#### Google OAuth:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   ```
   https://urtptlxotyyjfqynpbwx.supabase.co/auth/v1/callback
   https://proshnobank.vercel.app/auth/v1/callback
   ```
4. Copy Client ID and Secret to Supabase

#### Facebook OAuth:
1. Create app at developers.facebook.com
2. Add redirect URIs to Facebook App settings
3. Copy App ID and Secret to Supabase

### 5. CDN & Asset Configuration
- Images stored in Vercel Blob or Supabase Storage
- Configure CORS policies for media access
- Set up CDN caching for static assets

## Deployment Steps

### Step 1: Build Verification
```bash
cd /vercel/share/v0-project
npm run build
```

### Step 2: Production Deployment to Vercel
```bash
# Using Vercel CLI
vercel deploy --prod

# Or through GitHub (automatic on push to main)
git push origin main
```

### Step 3: Domain Configuration
1. Add custom domain `proshnobank.vercel.app` in Vercel settings
2. Configure DNS records
3. Enable automatic SSL certificate

### Step 4: Verify Deployment
```bash
# Test critical endpoints
curl https://proshnobank.vercel.app/
curl https://proshnobank.vercel.app/api/health
```

### Step 5: Monitor Performance
- Use Vercel Analytics dashboard
- Monitor error rates and response times
- Set up alerts for critical errors

## Post-Deployment

### 1. Database Backup Strategy
- Daily backups to AWS S3
- Point-in-time recovery enabled
- Test restore procedures weekly

### 2. Monitoring & Logging
- Set up Sentry for error tracking
- Enable CloudWatch for AWS resources
- Monitor Supabase logs for database issues

### 3. SSL/TLS Configuration
- Automatic renewal configured
- Force HTTPS redirects enabled
- Security headers properly set

### 4. Performance Optimization
- Enable Gzip compression
- Minify and bundle JavaScript
- Optimize images with next/image
- Use CDN for static files

### 5. Scaling Considerations
- Database connection pooling configured
- Redis cache for sessions (if needed)
- Load testing before peak usage
- Auto-scaling policies in place

## Rollback Plan

If issues occur after deployment:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy from specific commit
git revert <commit-hash>
git push origin main
```

## Database Backup

### Automatic Backups
- Supabase: Daily backups for 7 days
- AWS: Daily snapshots retained for 30 days

### Manual Backup
```bash
# Export from Supabase
pg_dump postgresql://[connection-string] > backup.sql

# Restore
psql postgresql://[connection-string] < backup.sql
```

## Security Checklist

- [ ] API keys rotated and stored securely
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS policies properly configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] User input validation on server-side
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] Admin access restricted and audited

## Support & Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Check IP whitelist in Supabase settings
   - Ensure firewall allows outbound connections

2. **Google OAuth Not Working**
   - Verify redirect URIs in both Google Cloud and Supabase
   - Check that OAuth app is in production mode
   - Clear browser cookies and retry

3. **Stripe Payment Failures**
   - Verify Stripe keys in environment variables
   - Check webhook endpoints are properly configured
   - Review Stripe logs for error details

4. **High Database Load**
   - Check for N+1 queries
   - Enable query caching
   - Consider database optimization

### Support Contacts
- Supabase Support: support@supabase.com
- Stripe Support: support@stripe.com
- Vercel Support: support@vercel.com

## Version Management

- Keep dependencies updated monthly
- Test major updates in staging first
- Maintain changelog in CHANGELOG.md
- Tag releases in Git

## Documentation

- API Documentation: `/docs/api`
- User Manual: `/docs/user-guide`
- Teacher Guide: `/docs/teacher-guide`
- Admin Documentation: `/docs/admin-guide`
