import React, { useState } from 'react';

interface ProtectionAgreementProps {
  onAgree: () => void;
}

const ProtectionAgreement: React.FC<ProtectionAgreementProps> = ({ onAgree }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-red-600">🔒 CONFIDENTIALITY AGREEMENT</h2>
        </div>
        
        <div className="p-6 space-y-4 text-sm">
          <div className="font-semibold text-lg">MUNICIPAL SERVICE DELIVERY PLATFORM - PROTECTED DEMO</div>
          
          <div className="space-y-3">
            <p><strong>This demo contains intellectual property developed by Nicolase Lesapo (2020-2024)</strong></p>
            
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <p className="font-semibold text-red-700">BY ACCESSING THIS DEMO, YOU AGREE:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-red-600">
                <li>This is confidential information for evaluation only</li>
                <li>No copying, modifying, or reverse engineering</li>
                <li>No sharing with third parties without written consent</li>
                <li>All concepts, code, and design remain property of Nicolase Lesapo</li>
                <li>IP logging and access monitoring are active</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2 mt-4">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="agree" className="text-sm">
                I understand and agree to these confidentiality terms. I acknowledge that unauthorized use or distribution may result in legal action.
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onAgree}
            disabled={!agreed}
            className={`px-6 py-2 rounded font-semibold ${
              agreed 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            ACCESS PROTECTED DEMO
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectionAgreement;
