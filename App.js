import React, { useState } from 'react';
import WalletView from './components/WalletView';
import KycAdminView from './components/KycAdminView';
import CredentialsView from './components/CredentialsView';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('wallet');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  
  // Sample KYC applications data
  const [kycApplications, setKycApplications] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'pending', date: '2023-06-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'approved', date: '2023-06-10' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', status: 'rejected', date: '2023-06-08' },
  ]);
  
  // Sample credentials data
  const [credentials, setCredentials] = useState([
    { id: 1, name: 'Identity Verification', issuer: 'KYC Authority', date: '2023-05-20', shared: false },
    { id: 2, name: 'Address Proof', issuer: 'Government', date: '2023-04-15', shared: true },
    { id: 3, name: 'Income Certificate', issuer: 'Tax Department', date: '2023-03-10', shared: false },
  ]);
  
  const connectWallet = () => {
    // Simulate wallet connection
    setWalletConnected(true);
    setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
    setWalletBalance(2.45);
  };
  
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setWalletBalance(0);
  };
  
  const approveKyc = (id) => {
    setKycApplications(kycApplications.map(app => 
      app.id === id ? {...app, status: 'approved'} : app
    ));
  };
  
  const rejectKyc = (id) => {
    setKycApplications(kycApplications.map(app => 
      app.id === id ? {...app, status: 'rejected'} : app
    ));
  };
  
  const toggleShareCredential = (id) => {
    setCredentials(credentials.map(cred => 
      cred.id === id ? {...cred, shared: !cred.shared} : cred
    ));
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">DecentralKYC</span>
              </div>
            </div>
            <div className="flex items-center">
              {walletConnected ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                  <button 
                    onClick={disconnectWallet}
                    className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-4">
          <button 
            onClick={() => setActiveView('wallet')}
            className={`px-3 py-2 text-sm font-medium nav-item ${activeView === 'wallet' ? 'active-nav' : 'text-gray-600'}`}
          >
            Wallet
          </button>
          <button 
            onClick={() => setActiveView('kyc')}
            className={`px-3 py-2 text-sm font-medium nav-item ${activeView === 'kyc' ? 'active-nav' : 'text-gray-600'}`}
          >
            KYC Admin
          </button>
          <button 
            onClick={() => setActiveView('credentials')}
            className={`px-3 py-2 text-sm font-medium nav-item ${activeView === 'credentials' ? 'active-nav' : 'text-gray-600'}`}
          >
            Credentials
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'wallet' && (
          <WalletView 
            connected={walletConnected} 
            address={walletAddress} 
            balance={walletBalance}
            onConnect={connectWallet}
          />
        )}
        
        {activeView === 'kyc' && (
          <KycAdminView 
            applications={kycApplications}
            onApprove={approveKyc}
            onReject={rejectKyc}
          />
        )}
        
        {activeView === 'credentials' && (
          <CredentialsView 
            credentials={credentials}
            onToggleShare={toggleShareCredential}
          />
        )}
      </main>
    </div>
  );
}

export default App;
