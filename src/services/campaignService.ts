import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export interface Campaign {
  id: string;
  type: "upgrade" | "coupon" | "seasonal" | "behavior";
  targetPlan: string;
  discount: number;
  expiresAt: number;
  active: boolean;
  name?: string;
}

export async function getActiveCampaigns(userPlan: string): Promise<Campaign[]> {
  try {
    const q = query(
      collection(db, "campaigns"),
      where("active", "==", true)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Campaign))
      .filter(c => c.targetPlan === userPlan);
  } catch (err) {
    console.error("Error fetching active campaign:", err);
    return [];
  }
}
