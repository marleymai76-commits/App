import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { isAdminMaster } from "../utils/starterFreePlan";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isOwner: boolean;
  role: string;
  userType: string;
  companyId: string;
  isBlocked: boolean;
  blockReason: string | null;
  permissions: string;
  isSuperadmin: boolean;
  refreshUserStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [role, setRole] = useState<string>('');
  const [userType, setUserType] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string>('');
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const refreshUserStatus = async () => {
    if (auth.currentUser) {
      try {
        const isMaster = isAdminMaster(auth.currentUser.email);
        if (isMaster) {
          setIsBlocked(false);
          setBlockReason(null);
          setRole('admin');
          setUserType('superadmin');
          setCompanyId('');
          setPermissions('ALL');
          setIsSuperadmin(true);
          return;
        }

        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setIsBlocked(!!userData.isBlocked);
          setBlockReason(userData.blockReason || null);
          setRole(userData.role || 'admin');
          setUserType(userData.type || 'companyOwner');
          setCompanyId(userData.companyId || '');
          setPermissions(userData.permissions || 'ALL');
          setIsSuperadmin(userData.role === 'superadmin' || userData.type === 'superadmin');
        }
      } catch (err) {
        console.error("Error refreshing user status:", err);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const isMaster = isAdminMaster(user.email);
        if (isMaster) {
          setRole('admin');
          setUserType('superadmin');
          setCompanyId('');
          setIsBlocked(false);
          setBlockReason(null);
          setPermissions('ALL');
          setIsSuperadmin(true);
          
          // Certifique-se de que o documento do usuário exista
          try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              role: 'admin',
              type: 'superadmin',
              name: user.email === "josephmarleypt@gmail.com" ? "Marley" : "Marley (Dev)",
              isBlocked: false,
              lastLoginAt: Date.now()
            }, { merge: true });

            // Também na coleção de staff
            const staffDocRef = doc(db, 'staff', user.uid);
            await setDoc(staffDocRef, {
              email: user.email,
              role: 'superadmin',
              permissions: 'full',
              name: user.email === "josephmarleypt@gmail.com" ? "Marley" : "Marley (Dev)"
            }, { merge: true });
          } catch (e) {
            console.error("Error securing master admin firestore records:", e);
          }
        } else {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setRole(userData.role || 'admin');
              setUserType(userData.type || 'companyOwner');
              setCompanyId(userData.companyId || '');
              setIsBlocked(!!userData.isBlocked);
              setBlockReason(userData.blockReason || null);
              setPermissions(userData.permissions || 'ALL');
              setIsSuperadmin(userData.role === 'superadmin' || userData.type === 'superadmin');
            } else {
              setRole('admin');
              setUserType('companyOwner');
              setCompanyId('');
              setIsBlocked(false);
              setBlockReason(null);
              setPermissions('ALL');
              setIsSuperadmin(false);
            }
          } catch (error) {
            console.error("Error fetching user profile in auth observer:", error);
            setRole('admin');
            setUserType('companyOwner');
            setCompanyId('');
            setIsBlocked(false);
            setBlockReason(null);
            setPermissions('ALL');
            setIsSuperadmin(false);
          }
        }
        
        const tokenResult = await user.getIdTokenResult();
        setIsOwner(isMaster || !!tokenResult.claims.isOwner || true);

        // Keep useAuthStore synchronized with Firebase auth session
        try {
          const { useAuthStore } = await import('../lib/store');
          const token = await user.getIdToken();
          useAuthStore.getState().login({
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
            role: 'admin'
          }, token, '');
        } catch {
          // ignore
        }
      } else {
        setIsOwner(false);
        setRole('');
        setUserType('');
        setCompanyId('');
        setIsBlocked(false);
        setBlockReason(null);
        setPermissions('');
        setIsSuperadmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const currentUid = auth.currentUser?.uid;
    const currentEmail = auth.currentUser?.email;
    if (currentUid) {
      try {
        const { logAction } = await import('../services/auditService');
        await logAction(currentUid, 'logout', { email: currentEmail });
      } catch (e) {
        console.error("Error logging logout:", e);
      }
    }
    await signOut(auth);
    setUser(null);
    setIsOwner(false);
    setRole('');
    setUserType('');
    setCompanyId('');
    setIsBlocked(false);
    setBlockReason(null);
    setPermissions('');
    setIsSuperadmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, isOwner, role, userType, companyId, isBlocked, blockReason, permissions, isSuperadmin, refreshUserStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
