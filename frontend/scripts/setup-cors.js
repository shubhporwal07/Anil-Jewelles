#!/usr/bin/env node

/**
 * Firebase Storage CORS Configuration Script
 * This script applies CORS settings to your Firebase Storage bucket
 */

import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  try {
    console.log('🔧 Firebase Storage CORS Configuration Tool\n');

    // Initialize Storage with service account key
    const keyPath = path.join(__dirname, 'anil-jewellers-a948c-firebase-adminsdk-fbsvc-f6f27949c6.json');
    
    console.log('📁 Using service account key:', keyPath);
    
    const storage = new Storage({
      keyFilename: keyPath,
      projectId: 'anil-jewellers-a948c'
    });

    const projectId = 'anil-jewellers-a948c';
    const bucketCandidates = [
      `${projectId}.appspot.com`,
      `${projectId}.firebasestorage.app`
    ];

    // Pick the first bucket that actually exists.
    let bucketName = null;
    for (const candidate of bucketCandidates) {
      const testBucket = storage.bucket(candidate);
      try {
        await testBucket.getMetadata();
        bucketName = candidate;
        break;
      } catch (error) {
        // Ignore not-found bucket and continue to next candidate.
      }
    }

    if (!bucketName) {
      throw new Error(`No accessible bucket found. Checked: ${bucketCandidates.join(', ')}`);
    }

    const bucket = storage.bucket(bucketName);

    // Define CORS configuration
    const corsConfiguration = [
      {
        origin: [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001'
        ],
        method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        responseHeader: ['Content-Type'],
        maxAgeSeconds: 3600
      }
    ];

    console.log('\n📝 Applying CORS Configuration...');
    console.log('Bucket:', bucketName);
    console.log('Allowed Origins:', corsConfiguration[0].origin);
    console.log('Allowed Methods:', corsConfiguration[0].method);

    // Set CORS configuration via bucket metadata
    await bucket.setMetadata({
      cors: corsConfiguration
    });

    console.log('\n✅ CORS configuration applied successfully!\n');

    // Verify the configuration was applied
    console.log('📋 Verifying CORS Configuration...\n');
    const [metadata] = await bucket.getMetadata();
    console.log('Current CORS Configuration:');
    console.log(JSON.stringify(metadata.cors || [], null, 2));

    console.log('\n✨ All Done! Your Firebase Storage is now configured for local development.');
    console.log('🔄 Next steps:');
    console.log('   1. Restart your dev server: npm run dev');
    console.log('   2. Hard refresh your browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
    console.log('   3. Try uploading an image in the Admin Panel');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error configuring CORS:');
    console.error(error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the service account JSON file exists');
    console.error('2. Make sure you have the correct project ID');
    console.error('3. Make sure you have the correct bucket name');
    process.exit(1);
  }
};

main();
