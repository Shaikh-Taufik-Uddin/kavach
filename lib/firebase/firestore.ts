import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from './config';
import { FirestoreVaultDocument } from '../types';

// 1. Upload the Encrypted Vault to a Tenant-Specific Path
export const uploadEncryptedVault = async (
  tenantId: string,
  caseId: string,
  encryptedCiphertextBase64: string,
  initializationVectorBase64: string
): Promise<void> => {
  const docRef = doc(db, 'tenants', tenantId, 'cases', caseId);
  
  const payload: FirestoreVaultDocument = {
    caseId,
    tenantId,
    status: 'LOCKED',
    createdAtServerTimestamp: serverTimestamp(),
    encryptedCiphertextBase64,
    initializationVectorBase64,
  };

  await setDoc(docRef, payload);
};

// 2. Fetch all LOCKED/UNDER_REVIEW cases for a specific Tenant (HR Admin View)
export const getTenantCases = async (tenantId: string): Promise<FirestoreVaultDocument[]> => {
  const casesRef = collection(db, 'tenants', tenantId, 'cases');
  // Note: orderBy requires a composite index in Firestore if combined with 'where'
  // For standard localhost hackathon rules, simple queries are preferred before indexing.
  const q = query(
    casesRef, 
    where('tenantId', '==', tenantId)
  );

  const querySnapshot = await getDocs(q);
  const cases: FirestoreVaultDocument[] = [];
  
  querySnapshot.forEach((document) => {
    cases.push(document.data() as FirestoreVaultDocument);
  });

  // Sort locally to avoid needing Firestore composite index setup during a hackathon
  return cases.sort((a, b) => {
    const timeA = a.createdAtServerTimestamp?.toMillis?.() || 0;
    const timeB = b.createdAtServerTimestamp?.toMillis?.() || 0;
    return timeB - timeA;
  });
};

// 3. Fetch a specific case payload by ID (Used before decryption)
export const getCaseVault = async (tenantId: string, caseId: string): Promise<FirestoreVaultDocument | null> => {
  const docRef = doc(db, 'tenants', tenantId, 'cases', caseId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as FirestoreVaultDocument;
  }
  return null;
};
