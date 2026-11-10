import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export async function createUserAccount(uid: string, companyId: string, type: string) {
  let role = "admin";

  if (type === "owner" || type === "companyOwner") role = "admin";
  if (type === "employee" || type === "staff") role = "staff";
  if (type === "customer" || type === "companyCustomer") role = "customer";
  if (type === "endCustomer" || type === "finalCustomer") role = "endCustomer";

  let finalType = type;
  if (type === "owner") finalType = "companyOwner";
  if (type === "employee") finalType = "employee";
  if (type === "customer") finalType = "companyCustomer";
  if (type === "endCustomer") finalType = "finalCustomer";

  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, {
      uid,
      companyId,
      role,
      type: finalType,
      plan: 'enterprise_fiscal',
      trialActive: true,
      createdAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn("Note on userDoc creation:", err);
  }
}
