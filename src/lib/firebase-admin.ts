import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

import firebaseConfig from '../../firebase-applet-config.json';

if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    credential: applicationDefault(),
  });
}

export const adminDb = getFirestore();
export const adminMessaging = getMessaging();
export default admin;
