import React from 'react';

export const KeyModal = ({ secretKey, caseId }: { secretKey: string, caseId: string }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">URGENT: Save Your Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          Your evidence (Case ID: <span className="font-mono bg-gray-100 px-1">{caseId}</span>) is heavily encrypted. 
          The server CANNOT recover this key. You must provide it to your HR Admin.
        </p>
        <div className="bg-gray-100 p-4 rounded text-2xl font-mono tracking-widest font-bold text-gray-800 mb-6 border border-gray-300">
          {secretKey}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gray-800 text-white px-6 py-2 rounded w-full hover:bg-gray-900"
        >
          I Have Copied The Key
        </button>
      </div>
    </div>
  );
};
