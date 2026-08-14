"use client";

import React, { useState } from 'react';
// import { useAuth } from '@/lib/firebase/auth-context'; // Uncomment when Auth Provider wraps the layout
import { encryptVault } from '@/lib/crypto/webcrypto';
import { uploadEncryptedVault } from '@/lib/firebase/firestore';
import { Dropzone } from '@/components/ui/Dropzone';
import { KeyModal } from '@/components/ui/KeyModal';
import { mockParseEvidence } from '@/lib/utils/mock-parser';

export default function StudentSubmitPage() {
  // Hardcoded tenantId for testing until Auth is wrapped in layout
  const tenantId = 'sit.ac.in'; 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  const handleProcessEvidence = async () => {
    setIsProcessing(true);
    try {
      // 1. Trigger Dev 2's AI Parsing (Mocked)
      const payload = mockParseEvidence(tenantId);
      
      // 2. Trigger Dev 3's Zero-Knowledge Encryption Pipeline
      const { secretKey: generatedKey, encryptedCiphertextBase64, ivBase64 } = await encryptVault(payload);
      
      // 3. Trigger Dev 3's Firestore Upload
      await uploadEncryptedVault(tenantId, payload.caseId, encryptedCiphertextBase64, ivBase64);
      
      // 4. Reveal the key to the user
      setSecretKey(generatedKey);
      setCaseId(payload.caseId);
    } catch (error) {
      console.error("Encryption/Upload Pipeline Failed:", error);
      alert("Failed to securely process evidence.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Evidence Vault</h1>
        <p className="text-gray-600 mb-8">
          Your data is encrypted directly in your browser. Our servers cannot read your messages.
        </p>

        {isProcessing ? (
          <div className="text-center p-12 bg-gray-50 rounded-lg animate-pulse">
            <p className="text-lg font-semibold text-blue-600">Encrypting Vault via AES-GCM 256...</p>
            <p className="text-sm text-gray-500">Generating Zero-Knowledge Keys</p>
          </div>
        ) : (
          <Dropzone onProcess={handleProcessEvidence} />
        )}

        {secretKey && caseId && (
          <KeyModal secretKey={secretKey} caseId={caseId} />
        )}
      </div>
    </div>
  );
}
