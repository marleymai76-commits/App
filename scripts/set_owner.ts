import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { adminDb } from '../src/lib/firebase-admin';

async function setOwnerClaim() {
  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
    });
  }
  const uid = '0wRwJiHf5VV1KzJiJQRFANuYaei2';
  try {
    await getAuth().setCustomUserClaims(uid, { isOwner: true });
    console.log(`Custom claim isOwner: true set for user ${uid}`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
}

setOwnerClaim();
