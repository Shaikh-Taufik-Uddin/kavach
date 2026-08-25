import { db } from './config';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

export const saveEncryptedLog = async (userId: string, ciphertextBase64: string, ivBase64: string): Promise<void> => {
  const vaultRef = doc(collection(db, 'vault'));
  await setDoc(vaultRef, {
    userId,
    ciphertextBase64,
    ivBase64,
    createdAt: new Date().toISOString()
  });
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
