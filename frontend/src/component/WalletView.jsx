import React from 'react';

const WalletView = ({ connected, address, balance, onConnect }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">User Wallet Interface</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your wallet and view your balance</p>
      </div>
      
      {connected ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="wallet-card text-white rounded-xl p-6 shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold">Your Wallet</h4>
                <p className="text-sm opacity-80">Connected to Ethereum</p>
              </div>
              <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="mb-4">
              <p className="text-sm opacity-80">Balance</p>
              <p className="text-2xl font-bold">{balance} ETH</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Address</p>
              <p className="text-sm font-mono bg-white bg-opacity-20 rounded-md px-2 py-1 mt-1">
                {address}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                <div>
                  <p className="text-sm font-medium">KYC Verification Fee</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <span className="text-red-600 font-medium">-0.05 ETH</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                <div>
                  <p className="text-sm font-medium">Received</p>
                  <p className="text-xs text-gray-500">5 days ago</p>
                </div>
                <span className="text-green-600 font-medium">+0.5 ETH</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-md shadow-sm">
                <div>
                  <p className="text-sm font-medium">Credential Issuance</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
                <span className="text-red-600 font-medium">-0.02 ETH</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
          <p className="mt-1 text-sm text-gray-500">Connect your wallet to access the decentralized KYC platform.</p>
          <div className="mt-6">
            <button
              onClick={onConnect}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
