"use client";

import React, { useEffect, useState } from 'react';
import { getTenantCases, getCaseVault } from '@/lib/firebase/firestore';
import { decryptVault } from '@/lib/crypto/webcrypto';
import { FirestoreVaultDocument, MasterVaultPayload } from '@/lib/types';
import { ReportView } from '@/components/ui/ReportView';

export default function AdminDashboardPage() {
  const tenantId = 'sit.ac.in'; // Hardcoded for hackathon integration phase
  
  const [cases, setCases] = useState<FirestoreVaultDocument[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [unlockKey, setUnlockKey] = useState('');
  const [decryptedPayload, setDecryptedPayload] = useState<MasterVaultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getTenantCases(tenantId);
        setCases(data);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, [tenantId]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDecryptedPayload(null);

    if (!selectedCaseId || unlockKey.length !== 16) {
      setError("Please select a case and enter a valid 16-character key.");
      return;
    }

    try {
      // 1. Fetch the raw encrypted Base64 strings from Firestore
      const vaultDoc = await getCaseVault(tenantId, selectedCaseId);
      if (!vaultDoc) throw new Error("Vault not found on server.");

      // 2. Perform strictly client-side decryption in browser memory
      const payload = await decryptVault(
        vaultDoc.encryptedCiphertextBase64,
        vaultDoc.initializationVectorBase64,
        unlockKey
      );

      setDecryptedPayload(payload);
    } catch (err: any) {
      setError(err.message || "Decryption failed. Invalid key or tampered payload.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ICC Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Tenant Workspace: <span className="font-mono bg-gray-200 px-1">{tenantId}</span></p>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg border-b pb-2 mb-4">Locked Vaults</h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading cases...</p>
            ) : cases.length === 0 ? (
              <p className="text-sm text-gray-500">No cases found.</p>
            ) : (
              <ul className="space-y-2">
                {cases.map((c) => (
                  <li 
                    key={c.caseId}
                    onClick={() => { setSelectedCaseId(c.caseId); setDecryptedPayload(null); setError(null); }}
                    className={`cursor-pointer p-3 rounded border text-sm ${selectedCaseId === c.caseId ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <span className="font-mono block truncate">{c.caseId}</span>
                    <span className="text-xs text-red-500 font-bold mt-1 inline-block">🔒 {c.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-2">
            {selectedCaseId && !decryptedPayload && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Unlock Case Vault</h3>
                <form onSubmit={handleUnlock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">16-Character Decryption Key</label>
                    <input 
                      type="text" 
                      value={unlockKey}
                      onChange={(e) => setUnlockKey(e.target.value.toUpperCase())}
                      maxLength={16}
                      className="w-full border-gray-300 rounded-md shadow-sm p-3 font-mono text-lg uppercase tracking-widest focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="XXXXYYYYZZZZ1234"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-3 rounded-md hover:bg-gray-800 transition shadow"
                  >
                    Decrypt Vault Locally
                  </button>
                  {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm font-semibold border border-red-300">
                      ⚠️ {error}
                    </div>
                  )}
                </form>
              </div>
            )}

            {decryptedPayload && (
              <ReportView report={decryptedPayload.legalReport} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
