import { adminDb } from '../src/lib/firebase-admin';

async function addAdmin() {
  const adminUid = 'AFO8163pLORjjwRN0Q93aLsJh8x2';
  try {
    await adminDb.collection('admins').doc(adminUid).set({
      createdAt: Date.now(),
    });
    console.log(`Admin ${adminUid} added successfully.`);
  } catch (error) {
    console.error('Error adding admin:', error);
  }
}

addAdmin();
