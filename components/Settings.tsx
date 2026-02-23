import React, { useState } from 'react';
import { ViewProps, AnalyticsStorageSettings, StorageRecord } from '../types';

export const Settings: React.FC<ViewProps> = ({ onNavigate }) => {
  // State for toggles (all enabled by default)
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  // Analytics storage settings
  const [storageSettings, setStorageSettings] = useState<AnalyticsStorageSettings>({
    storageFrequency: 'weekly',
    autoStorage: true,
    estimatedMonthlyCost: 0.45,
    storageHistory: [
      {
        id: '1',
        timestamp: new Date('2024-02-15'),
        dataSize: 2.3,
        transactionHash: '0x1234...5678',
        cost: 0.15,
        status: 'completed'
      },
      {
        id: '2',
        timestamp: new Date('2024-02-08'),
        dataSize: 2.1,
        transactionHash: '0xabcd...efgh',
        cost: 0.14,
        status: 'completed'
      },
      {
        id: '3',
        timestamp: new Date('2024-02-01'),
        dataSize: 2.4,
        transactionHash: '0x9876...5432',
        cost: 0.16,
        status: 'completed'
      }
    ]
  });

  const [isStoringManually, setIsStoringManually] = useState(false);

  const handleStorageFrequencyChange = (frequency: 'daily' | 'weekly' | 'monthly' | 'manual') => {
    setStorageSettings(prev => ({
      ...prev,
      storageFrequency: frequency,
      estimatedMonthlyCost: frequency === 'daily' ? 4.5 : frequency === 'weekly' ? 0.45 : frequency === 'monthly' ? 0.15 : 0
    }));
  };

  const handleManualStorage = async () => {
    setIsStoringManually(true);
    // Simulate storage process
    setTimeout(() => {
      const newRecord: StorageRecord = {
        id: Date.now().toString(),
        timestamp: new Date(),
        dataSize: 2.2,
        cost: 0.15,
        status: 'completed',
        transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`
      };
      setStorageSettings(prev => ({
        ...prev,
        storageHistory: [newRecord, ...prev.storageHistory]
      }));
      setIsStoringManually(false);
    }, 2000);
  };

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) => (
    <div className="flex justify-between items-center bg-[#1A1D1F] p-4 rounded-lg">
      <span className="text-white">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}
      >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <div className="space-y-8">
        {/* General Options Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-4">General Options</h3>
          <div className="space-y-3">
            <Toggle label="Dark Mode" checked={darkMode} onChange={setDarkMode} />
            <Toggle label="Email Notifications" checked={emailNotifications} onChange={setEmailNotifications} />
            <Toggle label="Public Profile" checked={publicProfile} onChange={setPublicProfile} />
            <Toggle label="Auto-Update" checked={autoUpdate} onChange={setAutoUpdate} />
          </div>
        </div>

        {/* Account Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Account</h3>
          <div className="space-y-3">
            <button className="w-full text-left bg-[#1A1D1F] hover:bg-[#2A2D2F] text-white py-3 px-4 rounded-lg flex justify-between items-center transition-colors">
              <span>Profile Settings</span>
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
            <button className="w-full text-left bg-[#1A1D1F] hover:bg-[#2A2D2F] text-white py-3 px-4 rounded-lg flex justify-between items-center transition-colors">
              <span>Notification Preferences</span>
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
            <button className="w-full text-left bg-[#1A1D1F] hover:bg-[#2A2D2F] text-white py-3 px-4 rounded-lg flex justify-between items-center transition-colors">
              <span>Appearance</span>
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
            <button className="w-full text-left bg-[#1A1D1F] hover:bg-[#2A2D2F] text-white py-3 px-4 rounded-lg flex justify-between items-center transition-colors">
              <span>Integrations</span>
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
            <button className="w-full text-left bg-[#1A1D1F] hover:bg-[#2A2D2F] text-white py-3 px-4 rounded-lg flex justify-between items-center transition-colors">
              <span>Billing & Subscription</span>
              <span className="material-symbols-outlined">arrow_forward_ios</span>
            </button>
          </div>
        </div>

        {/* Analytics Storage Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Analytics Storage</h3>
          
          {/* Storage Frequency Selector */}
          <div className="bg-[#1A1D1F] p-4 rounded-lg mb-3">
            <label className="text-white text-sm mb-2 block">Storage Frequency</label>
            <select
              value={storageSettings.storageFrequency}
              onChange={(e) => handleStorageFrequencyChange(e.target.value as any)}
              className="w-full bg-[#272A2D] text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>

          {/* Auto-Storage Toggle */}
          <div className="mb-3">
            <Toggle 
              label="Auto-Storage" 
              checked={storageSettings.autoStorage} 
              onChange={(val) => setStorageSettings(prev => ({ ...prev, autoStorage: val }))} 
            />
          </div>

          {/* Estimated Storage Costs */}
          <div className="bg-[#1A1D1F] p-4 rounded-lg mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">Estimated Monthly Cost</span>
              <span className="text-white font-semibold">${storageSettings.estimatedMonthlyCost.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500">
              Based on {storageSettings.storageFrequency} storage frequency
            </div>
          </div>

          {/* Manual Storage Trigger */}
          <button
            onClick={handleManualStorage}
            disabled={isStoringManually}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors mb-3"
          >
            {isStoringManually ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>Storing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">cloud_upload</span>
                <span>Store Analytics Now</span>
              </>
            )}
          </button>

          {/* On-Chain Storage History */}
          <div className="bg-[#1A1D1F] p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-3">Storage History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {storageSettings.storageHistory.map((record) => (
                <div key={record.id} className="bg-[#272A2D] p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {new Date(record.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="text-gray-400 text-xs">{record.dataSize} MB</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">${record.cost.toFixed(2)}</div>
                      <div className={`text-xs ${
                        record.status === 'completed' ? 'text-green-400' : 
                        record.status === 'pending' ? 'text-yellow-400' : 
                        'text-red-400'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  </div>
                  {record.transactionHash && (
                    <div className="text-xs text-gray-500 font-mono truncate">
                      {record.transactionHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};