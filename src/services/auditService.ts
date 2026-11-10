import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export async function logAction(uid: string | null | undefined, action: string, metadata: Record<string, any> = {}) {
  try {
    const actualUid = uid || 'anonymous';
    await addDoc(collection(db, "auditLogs"), {
      uid: actualUid,
      action,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        origin: window.location.origin,
      }
    });
    console.log(`[AuditLog] Logged action: "${action}" for user: ${actualUid}`);
  } catch (err) {
    console.error("Error writing audit log:", err);
  }
}
