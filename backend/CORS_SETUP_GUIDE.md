# Firebase Storage CORS Configuration Guide

## Problem
Your frontend (running on localhost:5173) is trying to upload images to Firebase Storage, but it's being blocked by CORS (Cross-Origin Resource Sharing) errors.

## Solution - Two Methods

### Method 1: Using Google Cloud Console (Easiest - No Installation Required)

1. **Get your Firebase Project ID**: `anil-jewellers-a948c`

2. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account (same one as Firebase)
   - Select project: **anil-jewellers-a948c**

3. **Navigate to Storage**:
   - Go to: Storage → Buckets
   - Click on bucket: **anil-jewellers-a948c.appspot.com**

4. **Upload CORS Configuration**:
   - Click on the bucket name
   - Go to **Configuration** tab
   - Scroll down to **CORS configuration**
   - Click **Edit CORS Configuration**
   - Paste the JSON below:

```json
[
  {
    "origin": ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

5. **Save** and wait 1-2 minutes for changes to apply

---

### Method 2: Using Google Cloud SDK (gsutil)

#### Step 1: Install Google Cloud SDK
- **Windows**: Download from https://cloud.google.com/sdk/docs/install
- Run the installer (gcloud-sdk-setup.exe)
- During installation, check "Install bundled Python"

#### Step 2: Initialize gsutil
Open PowerShell and run:
```bash
gcloud init
```
- Select your Google account
- Select project: **anil-jewellers-a948c**

#### Step 3: Apply CORS Configuration
The cors.json file is already created in the project root. Run:

```bash
gsutil cors set d:\apj\cors.json gs://anil-jewellers-a948c.appspot.com
```

#### Step 4: Verify
```bash
gsutil cors get gs://anil-jewellers-a948c.appspot.com
```

You should see your CORS configuration returned.

---

## After Applying CORS

1. **Restart the dev server**: Kill the current server and restart with `npm run dev`
2. **Hard refresh** your browser: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
3. **Try uploading an image** in the Admin Panel again
4. **Check the console** (F12) for success messages

---

## Troubleshooting

**Still getting CORS errors after applying rules?**

1. **Check bucket name**: Should be `anil-jewellers-a948c.appspot.com` (NOT `anil-jewellers-a948c.firebasestorage.app`)
2. **Wait for changes**: Google Cloud takes 1-2 minutes to apply changes
3. **Clear browser cache**: Do a hard refresh (Ctrl+Shift+R)
4. **Verify rules were applied**: Use `gsutil cors get` command to check
5. **Check Firebase Security Rules**: Go to Storage → Rules and make sure they allow uploads

---

## Recommended CORS Configuration for Production

For production, use your actual domain:

```json
[
  {
    "origin": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Never use `["*"]` in production as it allows any website to upload to your storage!
