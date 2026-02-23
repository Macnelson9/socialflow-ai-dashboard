import Dexie, { Table } from 'dexie';

export interface Transaction {
  id?: number;
  hash: string;
  type: 'payment' | 'mint' | 'other';
  amount: string;
  asset: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export class TransactionDatabase extends Dexie {
  transactions!: Table<Transaction, number>;

  constructor() {
    super('SocialFlowTransactionDB');
    this.version(1).stores({
      transactions: '++id, hash, type, amount, asset, timestamp, status'
    });
  }
}

export const db = new TransactionDatabase();

// Horizon API endpoint (Stellar testnet)
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Fetch transactions from Horizon API
export async function fetchTransactionsFromHorizon(address: string, limit: number = 20): Promise<Transaction[]> {
  try {
    const response = await fetch(
      `${HORIZON_URL}/accounts/${address}/transactions?limit=${limit}&order=desc`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions from Horizon');
    }

    const data = await response.json();
    
    return data.records.map((tx: any) => {
      // Determine transaction type
      let type: 'payment' | 'mint' | 'other' = 'other';
      let amount = '0';
      let asset = 'XLM';
      
      // Check operation types
      if (tx.operation_count > 0 && tx.operations) {
        const ops = tx.operations.records;
        if (ops.length > 0) {
          const op = ops[0];
          if (op.type === 'payment') {
            type = 'payment';
            amount = op.amount || '0';
            asset = op.asset_code || 'XLM';
          } else if (op.type === 'create_token' || op.type === 'clawback' || op.type === 'mint_liquidity') {
            type = 'mint';
            amount = op.amount || '0';
            asset = op.asset_code || 'XLM';
          }
        }
      }

      return {
        hash: tx.id,
        type,
        amount,
        asset,
        timestamp: tx.created_at,
        status: tx.successful ? 'success' : 'failed' as 'success' | 'pending' | 'failed'
      };
    });
  } catch (error) {
    console.error('Error fetching transactions from Horizon:', error);
    return [];
  }
}

// Sync transactions from Horizon to IndexedDB
export async function syncTransactions(address: string): Promise<void> {
  const remoteTransactions = await fetchTransactionsFromHorizon(address);
  
  if (remoteTransactions.length > 0) {
    await db.transactions.bulkPut(remoteTransactions);
  }
}

// Get all transactions from local DB
export async function getLocalTransactions(): Promise<Transaction[]> {
  return await db.transactions.orderBy('timestamp').reverse().toArray();
}

// Add a new transaction to local DB
export async function addTransaction(transaction: Transaction): Promise<number> {
  return await db.transactions.add(transaction);
}

// Filter transactions by type
export async function filterTransactionsByType(type: 'payment' | 'mint' | 'all'): Promise<Transaction[]> {
  if (type === 'all') {
    return await getLocalTransactions();
  }
  return await db.transactions.where('type').equals(type).toArray();
}

// Clear all transactions (for testing)
export async function clearTransactions(): Promise<void> {
  await db.transactions.clear();
}

// Get Stellar Expert URL for transaction
export function getStellarExpertUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
