import React from 'react';

export const Dropzone = ({ onProcess }: { onProcess: () => void }) => {
  return (
    <div className="border-2 border-dashed border-gray-400 p-10 text-center rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Secure Evidence Upload</h3>
      <p className="text-sm text-gray-500 mb-4">Drag and drop WhatsApp .txt exports or screenshots here.</p>
      <button 
        onClick={onProcess}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
      >
        Simulate AI Parsing & Encrypt
      </button>
    </div>
  );
};
