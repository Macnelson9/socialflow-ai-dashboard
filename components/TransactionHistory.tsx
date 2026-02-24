import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from './ui/Card';
import { Transaction, TransactionFilter, Platform } from '../types';
import { eventMonitor } from '../services/eventMonitor';

const MaterialIcon = ({ name, className }: { name: string, className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// Mock initial data
const generateInitialTransactions = (): Transaction[] => {
  const types: Transaction['type'][] = ['post', 'comment', 'like', 'share', 'follow', 'message', 'campaign', 'payment'];
  const platforms = Object.values(Platform);
  const statuses: Transaction['status'][] = ['pending', 'completed', 'failed'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `txn_${Date.now() - i * 60000}_${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    description: `Transaction ${i + 1}`,
    timestamp: new Date(Date.now() - i * 60000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    metadata: {},
    isNew: false,
  }));
};

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(generateInitialTransactions());
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [newTransactionCount, setNewTransactionCount] = useState(0);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = eventMonitor.subscribe((newTransaction) => {
      setTransactions(prev => [newTransaction, ...prev]);
      setNewTransactionCount(prev => prev + 1);
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
        setNewTransactionCount(0);
      }, 5000);

      // Remove isNew flag after animation
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(t => t.id === newTransaction.id ? { ...t, isNew: false } : t)
        );
      }, 3000);
    });

    return unsubscribe;
  }, []);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      if (filter.type && filter.type.length > 0 && !filter.type.includes(txn.type)) {
        return false;
      }
      if (filter.platform && filter.platform.length > 0 && !filter.platform.includes(txn.platform)) {
        return false;
      }
      if (filter.status && filter.status.length > 0 && !filter.status.includes(txn.status)) {
        return false;
      }
      if (searchQuery && !txn.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [transactions, filter, searchQuery]);

  const handleExport = useCallback(() => {
    const csv = [
      ['ID', 'Type', 'Platform', 'Description', 'Status', 'Timestamp'].join(','),
      ...filteredTransactions.map(t => 
        [t.id, t.type, t.platform, t.description, t.status, t.timestamp.toISOString()].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'text-teal-400 bg-teal-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    const icons: Record<Transaction['type'], string> = {
      post: 'article',
      comment: 'comment',
      like: 'favorite',
      share: 'share',
      follow: 'person_add',
      message: 'mail',
      campaign: 'campaign',
      payment: 'payments',
    };
    return icons[type];
  };

  return (
    <div className="p-7 space-y-7 animate-fade-in">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <Card className="bg-primary-blue/20 border-primary-blue">
            <div className="flex items-center gap-3">
              <MaterialIcon name="notifications_active" className="text-primary-blue" />
              <div>
                <p className="text-white font-medium">New Transaction{newTransactionCount > 1 ? 's' : ''}</p>
                <p className="text-sm text-gray-subtext">
                  {newTransactionCount} new transaction{newTransactionCount > 1 ? 's' : ''} received
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          <p className="text-sm text-gray-subtext mt-1">Track all activities and events</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-primary-blue text-white rounded-xl hover:bg-primary-blue/80 transition-colors"
        >
          <MaterialIcon name="download" />
          Export
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-subtext" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-subtext focus:outline-none focus:border-primary-blue transition-colors"
            />
          </div>
          
          <select
            onChange={(e) => {
              const value = e.target.value;
              setFilter(prev => ({
                ...prev,
                type: value ? [value as Transaction['type']] : undefined
              }));
            }}
            className="px-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary-blue transition-colors"
          >
            <option value="">All Types</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="like">Like</option>
            <option value="share">Share</option>
            <option value="follow">Follow</option>
            <option value="message">Message</option>
            <option value="campaign">Campaign</option>
            <option value="payment">Payment</option>
          </select>

          <select
            onChange={(e) => {
              const value = e.target.value;
              setFilter(prev => ({
                ...prev,
                status: value ? [value as Transaction['status']] : undefined
              }));
            }}
            className="px-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-white focus:outline-none focus:border-primary-blue transition-colors"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={() => {
              setFilter({});
              setSearchQuery('');
            }}
            className="px-4 py-2 border border-dark-border rounded-xl text-gray-subtext hover:bg-white/5 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <MaterialIcon name="inbox" className="text-6xl text-gray-subtext mb-4" />
                  <p className="text-gray-subtext">No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTransaction(txn)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      txn.isNew 
                        ? 'border-primary-blue bg-primary-blue/10 animate-pulse-subtle' 
                        : selectedTransaction?.id === txn.id
                        ? 'border-primary-blue bg-white/5'
                        : 'border-dark-border hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        txn.isNew ? 'bg-primary-blue' : 'bg-white/5'
                      }`}>
                        <MaterialIcon name={getTypeIcon(txn.type)} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{txn.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-primary-blue bg-primary-blue/10 px-2 py-0.5 rounded-full">
                                {txn.platform}
                              </span>
                              <span className="text-xs text-gray-subtext">
                                {txn.timestamp.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                      {txn.isNew && (
                        <div className="w-2 h-2 bg-primary-blue rounded-full animate-ping" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Transaction Detail */}
        <div>
          <Card className="sticky top-7">
            {selectedTransaction ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="text-gray-subtext hover:text-white transition-colors"
                  >
                    <MaterialIcon name="close" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-subtext mb-1">ID</p>
                    <p className="text-white font-mono text-sm">{selectedTransaction.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-subtext mb-1">Type</p>
                    <div className="flex items-center gap-2">
                      <MaterialIcon name={getTypeIcon(selectedTransaction.type)} className="text-primary-blue" />
                      <p className="text-white capitalize">{selectedTransaction.type}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-subtext mb-1">Platform</p>
                    <p className="text-white capitalize">{selectedTransaction.platform}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-subtext mb-1">Status</p>
                    <span className={`inline-block text-xs px-2 py-1 rounded-lg ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-subtext mb-1">Description</p>
                    <p className="text-white">{selectedTransaction.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-subtext mb-1">Timestamp</p>
                    <p className="text-white">{selectedTransaction.timestamp.toLocaleString()}</p>
                  </div>

                  {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-subtext mb-2">Metadata</p>
                      <div className="bg-dark-surface rounded-lg p-3 space-y-2">
                        {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-subtext">{key}:</span>
                            <span className="text-white">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MaterialIcon name="info" className="text-6xl text-gray-subtext mb-4" />
                <p className="text-gray-subtext">Select a transaction to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
