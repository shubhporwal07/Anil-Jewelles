# Firebase Configuration Guide

## Firebase Rules Setup

### 1. Firestore Security Rules

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → Rules

Replace with these rules (for development):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products are public-read so the storefront can load without auth.
    match /products/{document=**} {
      allow read: if true;
      // NOTE:
      // This project includes an "admin panel" login that is NOT Firebase Auth (it is localStorage based).
      // If you keep that approach, request.auth will be null, so writes will be blocked unless you allow them.
      //
      // For a real production setup, switch admin login to Firebase Auth + role checks.
      allow write: if true;
    }
    
    // Admin only for everything else
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Firebase Storage Rules

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Storage → Rules

Replace with these rules (for development):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
      // See note above: if admin panel is not using Firebase Auth, allow writes for dev/demo.
      allow write: if request.resource.size < 5242880;
    }
    
    // Specifically for products
    match /products/{fileName} {
      allow read: if true;
      allow write: if request.resource.size < 5242880;
    }
  }
}
```

### 3. Enable Authentication Methods

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password** (already enabled for users)
3. For admin panel, using hardcoded credentials is fine for demo

### 4. Firebase API Keys

- **API Key**: AIzaSyBql7UmSaDFNXovqoD2Wql-OT2CeJP4CsE
- **Project ID**: anil-jewellers-a948c
- **Storage Bucket**: anil-jewellers-a948c.appspot.com

All credentials are in `.env.local` file in the project root.

## Troubleshooting CORS Errors

If you still see CORS errors:

1. **Check Storage Rules**: Security rules must allow the operation
2. **Check Auth State**: Admin must be logged in to upload
3. **Check Bucket Name**: Should be `[project-id].appspot.com`
4. **Browser Console**: Check for specific error codes

## Testing the Admin Panel

1. Login: http://localhost:5173/admin/login
   - Admin ID: `admin`
   - Password: `admin`

2. Try adding a product with an image
3. Check browser console (F12) for detailed error logs
4. Check [Firebase Console](https://console.firebase.google.com) for real-time database activity
