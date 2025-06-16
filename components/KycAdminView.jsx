import React, { useState } from 'react';

const KycAdminView = ({ applications, onApprove, onReject }) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">KYC Administration</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Review and manage KYC applications</p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
          {/* Applications List */}
          <div className="col-span-1 overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-md font-medium text-gray-900">Applications</h4>
            </div>
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <li 
                  key={app.id} 
                  className="px-4 py-4 hover:bg-gray-50 cursor-pointer" 
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.email}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Application Details */}
          <div className="col-span-2">
            {selectedApplication ? (
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-900">Application Details</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedApplication.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </span>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Full name</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.name}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Email address</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.email}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Application date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedApplication.date}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Wallet address</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">0x8731D54E9D02c286767d56ac03e8037C07e01e98</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h5 className="text-md font-medium text-gray-900 mb-4">Submitted Documents</h5>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">ID Document</p>
                            <p className="text-xs text-gray-500">PDF • 2.4 MB</p>
                          </div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View</button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Selfie with ID</p>
                            <p className="text-xs text-gray-500">JPG • 1.8 MB</p>
                          </div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View</button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Proof of Address</p>
                            <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                          </div>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">View</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h5 className="text-md font-medium text-gray-900 mb-4">Review</h5>
                  <div className="mb-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Add review notes here..."
                    ></textarea>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onApprove(selectedApplication.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(selectedApplication.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-5 sm:p-6 flex flex-col items-center justify-center h-full">
                <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No application selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select an application from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycAdminView;
