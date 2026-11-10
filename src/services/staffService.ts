import { db } from '../lib/firebaseClient';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { isAdminMaster, MASTER_STAFF_DETAILS } from '~/utils/starterFreePlan';

export async function validateStaffAccess(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. SUPERADMIN sempre tem acesso
  if (isAdminMaster(normalizedEmail)) {
    return true;
  }

  try {
    // 2. Verificação normal de funcionário no Firestore
    const q = query(
      collection(db, "staff"),
      where("email", "==", normalizedEmail)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.error("Error validating staff access:", err);
    return false;
  }
}

export async function upsertStaff(email: string, role: string, permissions: string, name?: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const q = query(
      collection(db, "staff"),
      where("email", "==", normalizedEmail)
    );
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      // Atualizar existente
      const existingDocId = snap.docs[0].id;
      await setDoc(doc(db, "staff", existingDocId), {
        email: normalizedEmail,
        role,
        permissions,
        name: name || normalizedEmail.split('@')[0],
        updatedAt: Date.now()
      }, { merge: true });
    } else {
      // Criar novo com ID aleatório ou email
      const staffRef = doc(collection(db, "staff"));
      await setDoc(staffRef, {
        email: normalizedEmail,
        role,
        permissions,
        name: name || normalizedEmail.split('@')[0],
        createdAt: Date.now()
      });
    }
  } catch (err) {
    console.error("Error upserting staff:", err);
  }
}

export async function seedMasterStaff(): Promise<void> {
  try {
    for (const [masterEmail, detail] of Object.entries(MASTER_STAFF_DETAILS)) {
      if (detail) {
        await upsertStaff(masterEmail, detail.role, detail.permissions, detail.name);
        console.log(`[StaffService] Master staff seed completed for ${masterEmail}`);
      }
    }
  } catch (err) {
    console.error("Error seeding master staff:", err);
  }
}
