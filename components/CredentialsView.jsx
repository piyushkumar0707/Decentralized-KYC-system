import React, { useState } from 'react';

const CredentialsView = ({ credentials, onToggleShare }) => {
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  
  const handleShare = () => {
    if (selectedCredential) {
      onToggleShare(selectedCredential.id);
      setShowShareModal(false);
      setRecipientAddress('');
    }
  };
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Credential Management</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">View and share your verified credentials</p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((credential) => (
            <div 
              key={credential.id} 
              className="credential-card bg-white rounded-lg shadow-sm overflow-hidden"
              onClick={() => setSelectedCredential(credential)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="bg-indigo-100 rounded-md p-2">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    credential.shared ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {credential.shared ? 'Shared' : 'Private'}
                  </span>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-900">{credential.name}</h4>
                  <p className="text-sm text-gray-500">Issued by: {credential.issuer}</p>
                  <p className="text-sm text-gray-500">Date: {credential.date}</p>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCredential(credential);
                      setShowShareModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Credential Detail Modal */}
        {selectedCredential && !showShareModal && (
          <CredentialDetailModal 
            credential={selectedCredential} 
            onClose={() => setSelectedCredential(null)} 
            onShare={() => setShowShareModal(true)}
          />
        )}
        
        {/* Share Modal */}
        {showShareModal && selectedCredential && (
          <ShareCredentialModal 
            credential={selectedCredential}
            recipientAddress={recipientAddress}
            setRecipientAddress={setRecipientAddress}
            onShare={handleShare}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Credential Detail Modal Component
const CredentialDetailModal = ({ credential, onClose, onShare }) => {
  return (
    <div className="fixed inset-0 overflow-y-auto z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {credential.name}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    This credential was issued by {credential.issuer} on {credential.date}.
                  </p>
                </div>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Credential ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">VC-{Math.random().toString(36).substring(2, 10).toUpperCase()}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          credential.shared ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {credential.shared ? 'Shared' : 'Private'}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Blockchain Reference</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7a</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">Credential Data</h4>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
{`{
  "id": "urn:uuid:${Math.random().toString(36).substring(2, 15)}",
  "type": ["VerifiableCredential"],
  "issuer": "${credential.issuer}",
  "issuanceDate": "${credential.date}T00:00:00Z",
  "credentialSubject": {
    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
    "type": "${credential.name}"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onShare}
            >
              Share Credential
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Share Credential Modal Component
const ShareCredentialModal = ({ credential, recipientAddress, setRecipientAddress, onShare, onClose }) => {
  return (
    <div className="fixed inset-0 overflow-y-auto z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Share Credential
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Share your "{credential.name}" credential with another wallet address.
                  </p>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient Address</label>
                  <input
                    type="text"
                    name="recipient"
                    id="recipient"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                
                <div className="mt-4">
                  <label htmlFor="permissions" className="block text-sm font-medium text-gray-700">Permissions</label>
                  <select
                    id="permissions"
                    name="permissions"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>View only</option>
                    <option>View and verify</option>
                    <option>Full access</option>
                  </select>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">Expiration</label>
                  <select
                    id="expiration"
                    name="expiration"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option>24 hours</option>
                    <option>7 days</option>
                    <option>30 days</option>
                    <option>No expiration</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onShare}
            >
              Share
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CredentialsView;
