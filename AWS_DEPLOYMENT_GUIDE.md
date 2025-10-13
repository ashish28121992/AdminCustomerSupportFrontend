# AWS Deployment Guide - Customer Support System
## Complete Step-by-Step Guide (Hindi + English)

---

## 📋 Table of Contents
1. [Overview - Kya Deploy Karenge](#overview)
2. [Prerequisites - Pehle Ye Chahiye](#prerequisites)
3. [Database Setup - MongoDB Atlas](#step-1-database-setup)
4. [Backend Deployment - EC2 pe Backend](#step-2-backend-deployment)
5. [Frontend Deployment - S3 + CloudFront](#step-3-frontend-deployment)
6. [Final Configuration - Last Steps](#step-4-final-configuration)
7. [Testing - Sab Kaam Kar Raha Hai?](#step-5-testing)
8. [Troubleshooting - Problems & Solutions](#troubleshooting)

---

## 🎯 Overview - Kya Deploy Karenge {#overview}

**3 Cheezein Deploy Karenge:**
1. **Database** → MongoDB Atlas (Free Cloud Database)
2. **Backend** → AWS EC2 (Server for Node.js API)
3. **Frontend** → AWS S3 + CloudFront (React App Hosting)

**Total Cost Estimate:**
- MongoDB Atlas: **FREE** (512 MB)
- AWS EC2: **$3-5/month** (t2.micro)
- AWS S3 + CloudFront: **$1-2/month**
- **Total: ~$5-7/month** (bahut sasta!)

---

## ✅ Prerequisites - Pehle Ye Chahiye {#prerequisites}

### 1. AWS Account Banao
- Website: https://aws.amazon.com/
- Sign up karo (Credit/Debit card chahiye - but free tier use karenge)
- Email verification complete karo

### 2. MongoDB Atlas Account
- Website: https://www.mongodb.com/cloud/atlas/register
- Sign up karo (completely FREE)

### 3. Your Computer Pe Ye Install Ho
- ✅ Node.js (already hai)
- ✅ npm (already hai)
- ✅ Git
- ✅ AWS CLI (install karenge)

### 4. Code Ready Rakho
- ✅ Frontend: `/Users/ashishtiwari/Documents/www/admin_customer_support`
- ✅ Backend: `/Users/ashishtiwari/Documents/www/Customer_support`

---

## 🗄️ STEP 1: Database Setup - MongoDB Atlas {#step-1-database-setup}

### Step 1.1: MongoDB Atlas Account Banao
```
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up karo (Google login se bhi kar sakte ho)
3. Email verify karo
```

### Step 1.2: Free Cluster Banao
```
1. Dashboard pe "Create" button pe click karo
2. Select: "M0 FREE" plan
3. Cloud Provider: "AWS"
4. Region: "Mumbai (ap-south-1)" ya nearest region
5. Cluster Name: "CustomerSupport"
6. Click "Create Cluster" (2-3 min lagega)
```

### Step 1.3: Database User Banao
```
1. Left sidebar → "Database Access"
2. Click "Add New Database User"
3. Username: customer_support_user
4. Password: Generate karo (copy karke safe rakho!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"
```

### Step 1.4: Network Access Allow Karo
```
1. Left sidebar → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   ⚠️ Production mein sirf apne EC2 ka IP add karna
4. Click "Confirm"
```

### Step 1.5: Connection String Copy Karo
```
1. Left sidebar → "Database" → "Connect"
2. Click "Drivers"
3. Select: "Node.js" aur version "4.0 or later"
4. Connection String dikha:
   mongodb+srv://customer_support_user:<password>@customersupport.xxxxx.mongodb.net/?retryWrites=true&w=majority

5. Isko copy karo aur <password> ko apne actual password se replace karo
6. Database name add karo (end mein):
   mongodb+srv://customer_support_user:YOUR_PASSWORD@customersupport.xxxxx.mongodb.net/customer_support?retryWrites=true&w=majority

7. Save this string! Backend mein use hoga
```

**✅ Database Ready!** Ab backend deploy karte hain.

---

## 🖥️ STEP 2: Backend Deployment - EC2 pe Backend {#step-2-backend-deployment}

### Step 2.1: AWS CLI Install Karo

**Mac/Linux:**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify installation
aws --version
```

**Windows:**
```
Download installer: https://awscli.amazonaws.com/AWSCLIV2.msi
Install karo aur cmd restart karo
```

### Step 2.2: AWS Configure Karo

```bash
aws configure
```

**Input Details:**
```
AWS Access Key ID: (AWS console se milega - niche dekho)
AWS Secret Access Key: (AWS console se milega)
Default region name: ap-south-1 (Mumbai)
Default output format: json
```

**Access Keys kaise milenge:**
```
1. AWS Console → Your Name (top right) → Security credentials
2. Access keys section → "Create access key"
3. Select "CLI" → Next → Create
4. Copy both keys aur safe rakho!
```

### Step 2.3: EC2 Instance Launch Karo

#### AWS Console Method (Easy Way):

```
1. AWS Console → EC2 → "Launch Instance"

2. Name: CustomerSupport-Backend

3. Amazon Machine Image (AMI):
   - Select: "Ubuntu Server 22.04 LTS"

4. Instance Type:
   - Select: "t2.micro" (Free Tier)

5. Key Pair:
   - Click "Create new key pair"
   - Name: customer-support-key
   - Type: RSA
   - Format: .pem (Mac/Linux) ya .ppk (Windows)
   - Download karo aur safe rakho!

6. Network Settings:
   - Allow SSH traffic from: Anywhere (0.0.0.0/0)
   - Allow HTTPS traffic from: Internet
   - Allow HTTP traffic from: Internet
   - Click "Edit" aur add:
     * Custom TCP → Port 4000 → Anywhere (Backend API port)

7. Storage:
   - 8 GB (default - enough hai)

8. Click "Launch Instance"

9. Wait 2-3 minutes for "Running" status
```

### Step 2.4: EC2 pe Connect Karo

**Mac/Linux:**
```bash
# Key file ko secure karo
chmod 400 ~/Downloads/customer-support-key.pem

# SSH connect karo (EC2 public IP use karo)
ssh -i ~/Downloads/customer-support-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Example:
# ssh -i ~/Downloads/customer-support-key.pem ubuntu@13.235.XX.XXX
```

**Windows (PuTTY use karo):**
```
1. Download PuTTY: https://www.putty.org/
2. .ppk key use karo
3. Host: ubuntu@YOUR_EC2_PUBLIC_IP
4. Connection → SSH → Auth → Browse → Select .ppk file
5. Open
```

### Step 2.5: EC2 pe Server Setup Karo

**EC2 SSH terminal mein ye commands run karo:**

```bash
# System update karo
sudo apt update && sudo apt upgrade -y

# Node.js aur npm install karo (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # v20.x.x
npm --version   # 10.x.x

# Git install karo
sudo apt install -y git

# PM2 install karo (process manager)
sudo npm install -g pm2
```

### Step 2.6: Backend Code Deploy Karo

**Option A: Git se Pull Karo (Recommended)**

```bash
# Home directory mein jao
cd ~

# Git clone karo (apna GitHub repo URL use karo)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/Customer_support

# Dependencies install karo
npm install

# Environment file banao
nano .env
```

**Option B: Local se Upload Karo (SCP use karke)**

```bash
# Apne local Mac terminal mein (new tab):
cd /Users/ashishtiwari/Documents/www

# Backend folder EC2 pe upload karo
scp -i ~/Downloads/customer-support-key.pem -r Customer_support ubuntu@YOUR_EC2_PUBLIC_IP:~/

# Wapas EC2 SSH terminal mein jao
cd ~/Customer_support
npm install
```

### Step 2.7: Environment Variables Set Karo

**EC2 terminal mein:**

```bash
nano .env
```

**Ye paste karo (apni values se replace karo):**

```env
NODE_ENV=production
PORT=4000

# MongoDB Atlas connection string (Step 1.5 se)
MONGO_URI=mongodb+srv://customer_support_user:YOUR_PASSWORD@customersupport.xxxxx.mongodb.net/customer_support?retryWrites=true&w=majority

# JWT Secret (naya generate karo)
JWT_ACCESS_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_ACCESS_EXPIRES_IN=15m

# Email Configuration (SendGrid recommended)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-sendgrid-api-key
EMAIL_FROM=your-verified-email@gmail.com

# Frontend URL (abhi localhost, baad mein update karenge)
FRONTEND_URL=http://localhost:3000

# CORS Origin (frontend ka URL)
CORS_ORIGIN=http://localhost:3000
CORS_WHITELIST=http://localhost:3000

# App name
APP_NAME=Customer Support System
```

**Save karo:**
```
Ctrl + O → Enter → Ctrl + X
```

### Step 2.8: Backend Start Karo with PM2

```bash
# PM2 se start karo
pm2 start src/server.js --name customer-support-backend

# PM2 ko system startup pe auto-start karo
pm2 startup
# Jo command dikhe, usko run karo (sudo command)

pm2 save

# Check status
pm2 status
pm2 logs customer-support-backend
```

### Step 2.9: Backend Test Karo

```bash
# EC2 terminal mein:
curl http://localhost:4000/health

# Response aana chahiye:
# {"status":"ok"}
```

**Apne browser mein test karo:**
```
http://YOUR_EC2_PUBLIC_IP:4000/health
```

**✅ Backend Live!** URL save karo: `http://YOUR_EC2_PUBLIC_IP:4000`

---

## 🌐 STEP 3: Frontend Deployment - S3 + CloudFront {#step-3-frontend-deployment}

### Step 3.1: Frontend Build Ready Karo

**Apne local Mac terminal mein:**

```bash
cd /Users/ashishtiwari/Documents/www/admin_customer_support

# Backend URL update karo
nano src/config.js
```

**Update karo:**

```javascript
// Backend ka EC2 URL use karo
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://YOUR_EC2_PUBLIC_IP:4000';

export const AUTH_TOKEN_KEY = process.env.REACT_APP_AUTH_TOKEN_KEY || 'accessToken';
```

**Save karo aur build banao:**

```bash
# Production build banao
npm run build

# Build folder ban jayega: build/
ls build/
```

### Step 3.2: S3 Bucket Banao

**AWS Console mein:**

```
1. AWS Console → S3 → "Create bucket"

2. Bucket name: customer-support-frontend
   (Unique hona chahiye globally)

3. Region: ap-south-1 (Mumbai)

4. Block Public Access:
   - ❌ UNCHECK "Block all public access"
   - ✅ Check acknowledgement box

5. Versioning: Enable (optional)

6. Click "Create bucket"
```

### Step 3.3: Build Files Upload Karo

**AWS Console Method:**

```
1. S3 → customer-support-frontend bucket → "Upload"
2. "Add files" aur "Add folder" use karke sab files upload karo
   from: /Users/ashishtiwari/Documents/www/admin_customer_support/build/
3. Upload shuru karo
```

**AWS CLI Method (Faster):**

```bash
cd /Users/ashishtiwari/Documents/www/admin_customer_support

aws s3 sync build/ s3://customer-support-frontend --delete
```

### Step 3.4: S3 Bucket ko Static Website Banao

```
1. S3 bucket → "Properties" tab
2. Scroll down to "Static website hosting"
3. Click "Edit"
4. Enable: "Static website hosting"
5. Index document: index.html
6. Error document: index.html (for React routing)
7. Save changes
8. Bucket website URL copy karo
```

### Step 3.5: Bucket Policy Set Karo (Public Access)

```
1. S3 bucket → "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::customer-support-frontend/*"
    }
  ]
}
```

```
5. Save changes
```

### Step 3.6: CloudFront Distribution Banao (Optional but Recommended)

**CloudFront kya hai?** CDN hai - fast loading, HTTPS support

```
1. AWS Console → CloudFront → "Create distribution"

2. Origin domain:
   - Select your S3 bucket: customer-support-frontend

3. Origin access:
   - Select "Origin access control settings (recommended)"
   - Click "Create control setting"
   - Click "Create"

4. Default cache behavior:
   - Viewer protocol policy: "Redirect HTTP to HTTPS"

5. Settings:
   - Price class: "Use only North America and Europe" (sasta)
   - Alternate domain name (CNAME): (optional - apna domain)
   - Custom SSL certificate: (optional - baad mein)
   - Default root object: index.html

6. Click "Create distribution"

7. Wait 10-15 minutes for deployment
   Status: "Enabled" hone ka wait karo

8. CloudFront URL copy karo (xxx.cloudfront.net)
```

### Step 3.7: CloudFront Error Pages Configure Karo (React Routing ke liye)

```
1. CloudFront distribution select karo
2. "Error pages" tab
3. "Create custom error response"
4. HTTP error code: 403
5. Customize error response: Yes
6. Response page path: /index.html
7. HTTP response code: 200
8. Click "Create"
9. Repeat for error code 404
```

**✅ Frontend Live!** CloudFront URL: `https://xxx.cloudfront.net`

---

## ⚙️ STEP 4: Final Configuration {#step-4-final-configuration}

### Step 4.1: Backend CORS Update Karo

**EC2 SSH terminal mein:**

```bash
cd ~/Customer_support
nano .env
```

**Update karo:**

```env
# Frontend CloudFront URL add karo
FRONTEND_URL=https://xxx.cloudfront.net
CORS_ORIGIN=https://xxx.cloudfront.net
CORS_WHITELIST=https://xxx.cloudfront.net,http://localhost:3000
```

**Backend restart karo:**

```bash
pm2 restart customer-support-backend
pm2 logs customer-support-backend
```

### Step 4.2: Root Admin Seed Karo

```bash
cd ~/Customer_support

# Root admin banao
npm run seed:root

# Note down credentials (console mein dikhega)
# Email: root@customersupport.com
# Password: Root@123
```

### Step 4.3: HTTPS Setup (Optional - Recommended)

**Free SSL Certificate ke liye:**

1. **Domain Kharido** (GoDaddy, Namecheap, etc.)
2. **AWS Certificate Manager:**
   - Request public certificate
   - Domain verify karo
3. **CloudFront mein add karo:**
   - Alternate domain name: yourdomain.com
   - SSL Certificate: Select ACM certificate
4. **Route 53 ya Domain DNS:**
   - CNAME record: CloudFront URL point karo

### Step 4.4: Backend ke liye Domain (Optional)

**Option A: Elastic IP (Recommended)**

```
1. EC2 → Elastic IPs → "Allocate Elastic IP address"
2. Actions → "Associate Elastic IP address"
3. Instance: Select your EC2
4. Associate
5. Now EC2 ka permanent IP hai!
```

**Option B: Load Balancer + HTTPS**

```
1. EC2 → Load Balancers → Create Application Load Balancer
2. Target Group: Your EC2 instance (port 4000)
3. ACM SSL certificate add karo
4. Domain ka A record → Load Balancer point karo
```

---

## 🧪 STEP 5: Testing - Sab Kaam Kar Raha Hai? {#step-5-testing}

### Test 1: Backend Health Check

```bash
curl http://YOUR_EC2_PUBLIC_IP:4000/health
# Response: {"status":"ok"}
```

### Test 2: Frontend Loading

```
Browser mein open karo: https://xxx.cloudfront.net
- Login page dikha?
- UI load ho raha hai?
```

### Test 3: Frontend → Backend Connection

```
1. Login page pe jao
2. Wrong credentials enter karo
3. Error message dikha? (Backend se aa raha hai!)
4. Correct credentials try karo:
   Email: root@customersupport.com
   Password: Root@123
5. Login successful?
```

### Test 4: Database Connection

```
1. Admin dashboard mein jao
2. Users list dekho
3. New user create karo
4. Data save ho raha hai?
```

### Test 5: API Endpoints

```bash
# Health
curl https://YOUR_CLOUDFRONT_URL/health

# Login
curl -X POST http://YOUR_EC2_IP:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@customersupport.com","password":"Root@123"}'
```

---

## 🔧 Troubleshooting - Common Issues {#troubleshooting}

### Issue 1: Backend Not Accessible from Frontend

**Problem:** CORS error ya connection refused

**Solution:**
```bash
# EC2 Security Group check karo
1. EC2 → Security Groups
2. Inbound rules mein Port 4000 allow hai?
3. Source: 0.0.0.0/0 (or CloudFront IPs)

# CORS check karo
cd ~/Customer_support
nano .env
# CORS_ORIGIN correct hai?
pm2 restart customer-support-backend
```

### Issue 2: MongoDB Connection Failed

**Problem:** MongoNetworkError

**Solution:**
```bash
# Connection string check karo
cd ~/Customer_support
nano .env
# MONGO_URI correct hai?
# Password mein special characters escape kiye?

# MongoDB Atlas network access check karo
# 0.0.0.0/0 allowed hai?

# Test connection
node -e "import('mongoose').then(m => m.default.connect(process.env.MONGO_URI).then(() => console.log('Connected!')).catch(e => console.error(e)))"
```

### Issue 3: PM2 Process Crashed

```bash
# Check logs
pm2 logs customer-support-backend

# Check status
pm2 status

# Restart
pm2 restart customer-support-backend

# If port already in use
sudo lsof -i :4000
sudo kill -9 <PID>
pm2 restart customer-support-backend
```

### Issue 4: Frontend Showing 404 on Refresh

**Problem:** CloudFront/S3 routing issue

**Solution:**
```
CloudFront → Error pages
Create custom error responses (Step 3.7)
403 → /index.html → 200
404 → /index.html → 200
```

### Issue 5: Environment Variables Not Working

```bash
# Check .env file
cd ~/Customer_support
cat .env
# Sab variables set hain?

# PM2 restart karo (env reload)
pm2 delete customer-support-backend
pm2 start src/server.js --name customer-support-backend
pm2 save
```

### Issue 6: High AWS Costs

**Solution:**
```
1. EC2: t2.micro use karo (free tier)
2. S3: Old files delete karo
3. CloudFront: Caching properly set karo
4. MongoDB Atlas: Free tier M0 use karo
5. Elastic IP: Agar use nahi ho raha to release karo
```

---

## 📊 Deployment Checklist

### Before Deployment
- [ ] Git repository ready
- [ ] .env.example file hai
- [ ] .gitignore mein .env hai
- [ ] Frontend build successful
- [ ] Backend locally test kiya

### Database
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string tested

### Backend (EC2)
- [ ] EC2 instance launched (t2.micro)
- [ ] Security group configured (SSH, HTTP, 4000)
- [ ] Node.js installed
- [ ] PM2 installed
- [ ] Code deployed
- [ ] .env configured
- [ ] PM2 running
- [ ] Root admin seeded
- [ ] Health endpoint working

### Frontend (S3 + CloudFront)
- [ ] S3 bucket created
- [ ] Static website hosting enabled
- [ ] Bucket policy set (public read)
- [ ] Build files uploaded
- [ ] CloudFront distribution created
- [ ] Error pages configured (403, 404)
- [ ] HTTPS working
- [ ] React routing working

### Final Configuration
- [ ] Backend CORS updated
- [ ] Frontend API_BASE_URL updated
- [ ] End-to-end testing done
- [ ] Login working
- [ ] Database CRUD working

### Security (Production)
- [ ] Strong JWT secret
- [ ] MongoDB Atlas IP whitelist (EC2 IP only)
- [ ] EC2 security group restricted
- [ ] HTTPS enabled (CloudFront)
- [ ] Sensitive data in .env (not in code)
- [ ] SendGrid/AWS SES for emails (not Gmail)

---

## 🎯 Next Steps

### 1. Custom Domain Setup
```
1. Domain kharido (GoDaddy, Namecheap)
2. AWS Route 53 setup
3. CloudFront custom domain add karo
4. SSL certificate (ACM)
5. DNS records configure karo
```

### 2. Monitoring & Logging
```
1. CloudWatch setup (EC2 metrics)
2. PM2 logs monitor karo
3. Error tracking (Sentry)
4. Uptime monitoring (UptimeRobot)
```

### 3. Backups
```
1. MongoDB Atlas automatic backups (free tier mein limited)
2. EC2 snapshots (weekly)
3. S3 versioning enabled
4. Code GitHub pe backed up
```

### 4. CI/CD Setup
```
1. GitHub Actions setup
2. Automatic deployment on push
3. Automated testing
```

### 5. Performance Optimization
```
1. CloudFront caching optimize karo
2. Backend response compression
3. Database indexes
4. Image optimization
```

---

## 🆘 Support & Resources

### AWS Documentation
- EC2: https://docs.aws.amazon.com/ec2/
- S3: https://docs.aws.amazon.com/s3/
- CloudFront: https://docs.aws.amazon.com/cloudfront/

### MongoDB Atlas
- Docs: https://docs.atlas.mongodb.com/

### Helpful Commands

```bash
# EC2 Connect
ssh -i key.pem ubuntu@EC2_IP

# PM2 Commands
pm2 status
pm2 logs
pm2 restart all
pm2 stop all
pm2 delete all

# AWS CLI
aws s3 sync build/ s3://bucket-name
aws ec2 describe-instances
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# Git Deploy
git pull origin main
npm install
pm2 restart all
```

### Estimated Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free | $0 |
| EC2 t2.micro | Free Tier (1st year) | $0 - $5/month |
| S3 Storage | Pay as you go | $0.50/month |
| CloudFront | Free Tier | $0 - $1/month |
| **TOTAL** | | **$0.50 - $6.50/month** |

---

## ✅ Deployment Complete!

**Congratulations! 🎉** Aapka application successfully AWS pe deploy ho gaya!

**Your Live URLs:**
- Frontend: `https://xxx.cloudfront.net`
- Backend: `http://YOUR_EC2_IP:4000`
- Database: `MongoDB Atlas`

**Login Credentials:**
- Email: `root@customersupport.com`
- Password: `Root@123`

⚠️ **Important:** Production mein password change kar lena!

---

## 📞 Contact

Agar koi issue aaye ya help chahiye:
1. PM2 logs check karo: `pm2 logs`
2. CloudWatch logs dekho
3. MongoDB Atlas logs check karo
4. Is guide ko refer karo

**Happy Deploying! 🚀**

