import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './config';
import { UserRole } from '../types';

const provider = new GoogleAuthProvider();

// Mock HR Whitelist (Domain specific)
const HR_WHITELIST = ['hr@sit.ac.in', 'icc_chair@sit.ac.in'];

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

export const resolveUserRoleAndTenant = (email: string | null): { role: UserRole, tenantId: string | null } => {
  if (!email) return { role: null, tenantId: null };

  const tenantId = email.split('@')[1]?.toLowerCase() || null;
  const role: UserRole = HR_WHITELIST.includes(email.toLowerCase()) ? 'HR_ADMIN' : 'VICTIM_STUDENT';

  return { role, tenantId };
};
