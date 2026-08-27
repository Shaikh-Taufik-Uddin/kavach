import { db } from './config';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

export const saveEncryptedLog = async (userId: string, ciphertextBase64: string, ivBase64: string, tenantId: string = 'sit.ac.in'): Promise<string> => {
  const vaultRef = doc(collection(db, 'vault'));
  const caseId = vaultRef.id;
  
  console.log(`[KAVACH VAULT] Writing case to Firestore...`);
  console.log(`[KAVACH VAULT] caseId: ${caseId}`);
  console.log(`[KAVACH VAULT] tenantId: ${tenantId}`);
  
  await setDoc(vaultRef, {
    userId,
    tenantId,
    ciphertextBase64,
    ivBase64,
    createdAt: new Date().toISOString()
  });
  
  console.log(`[KAVACH VAULT] ✅ Case ${caseId} successfully written to Firestore.`);
  return caseId;
};

export const fetchEncryptedLogs = async (userId: string): Promise<{ ciphertextBase64: string, ivBase64: string }[]> => {
  const q = query(collection(db, 'vault'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const logs: { ciphertextBase64: string, ivBase64: string }[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    logs.push({
      ciphertextBase64: data.ciphertextBase64,
      ivBase64: data.ivBase64
    });
  });
  
  return logs;
};

export const fetchAllVaultLogs = async (): Promise<any[]> => {
  const querySnapshot = await getDocs(collection(db, 'vault'));
  const logs: any[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    logs.push({
      caseId: doc.id,
      tenantId: 'sit.ac.in', // Default for this specific demo integration
      status: 'LOCKED',
      createdAtServerTimestamp: new Date(data.createdAt).getTime() || Date.now(),
      encryptedCiphertextBase64: data.ciphertextBase64,
      initializationVectorBase64: data.ivBase64,
    });
  });
  // Sort newest first
  return logs.sort((a, b) => b.createdAtServerTimestamp - a.createdAtServerTimestamp);
};
