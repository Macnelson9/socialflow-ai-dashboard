# Soroban Contract Bridge - Quick Start

Get up and running with Soroban smart contracts in 5 minutes.

## Prerequisites

1. Install a Stellar wallet:
   - [Freighter](https://www.freighter.app/) (Chrome/Firefox extension)
   - [Albedo](https://albedo.link/) (Web-based)

2. Configure wallet for Testnet

3. Get test XLM from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

## Installation

Dependencies are already installed. Just import and use:

```typescript
import { 
  sorobanService,
  walletService,
  useSorobanContract 
} from './blockchain';
```

## 3 Ways to Use

### 1. Direct Service Usage (Vanilla JS/TS)

```typescript
import { sorobanService, walletService, ContractCallType } from './blockchain';
import { addressToScVal, u64ToScVal } from './blockchain';

// Connect wallet
const wallet = await walletService.autoConnect();

// Read contract (no signature)
const balance = await sorobanService.invoke(
  {
    contractId: 'CCONTRACT_ID',
    method: 'balance',
    args: [addressToScVal(wallet.publicKey)],
  },
  wallet.publicKey,
  ContractCallType.READ_ONLY
);

// Write contract (requires signature)
const signTx = async (xdr: string) => 
  await walletService.signTransaction(xdr, 'testnet');

const result = await sorobanService.invoke(
  {
    contractId: 'CCONTRACT_ID',
    method: 'transfer',
    args: [
      addressToScVal(wallet.publicKey),
      addressToScVal('GRECIPIENT'),
      u64ToScVal(1000000n),
    ],
  },
  wallet.publicKey,
  ContractCallType.STATE_CHANGING,
  signTx
);

console.log('TX Hash:', result.transactionHash);
```

### 2. React Hook (Recommended)

```typescript
import { useSorobanContract } from './blockchain/hooks/useSorobanContract';
import { addressToScVal, u64ToScVal } from './blockchain';

function TokenTransfer() {
  const {
    wallet,
    isLoading,
    error,
    connectWallet,
    readContract,
    writeContract,
  } = useSorobanContract('CCONTRACT_ID', 'TESTNET');

  const handleTransfer = async () => {
    const result = await writeContract('transfer', [
      addressToScVal(wallet!.publicKey),
      addressToScVal('GRECIPIENT'),
      u64ToScVal(1000000n),
    ]);
    
    alert(`Success! TX: ${result.transactionHash}`);
  };

  return (
    <div>
      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <button onClick={handleTransfer} disabled={isLoading}>
          Transfer
        </button>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### 3. Demo Component

```typescript
import { SorobanDemo } from './blockchain/components/SorobanDemo';

function App() {
  return <SorobanDemo />;
}
```

## Common Operations

### Read Balance

```typescript
const result = await readContract('balance', [
  addressToScVal(userAddress)
]);
const balance = fromScVal(result);
```

### Transfer Tokens

```typescript
const result = await writeContract('transfer', [
  addressToScVal(fromAddress),
  addressToScVal(toAddress),
  u64ToScVal(amount),
]);
```

### Get Contract Events

```typescript
const { getEvents } = useSorobanContract('CONTRACT_ID');
const events = await getEvents();
```

### Simulate Before Execution

```typescript
const { simulateContract } = useSorobanContract('CONTRACT_ID');
const simulation = await simulateContract('transfer', [
  addressToScVal(from),
  addressToScVal(to),
  u64ToScVal(amount),
]);

console.log('Estimated cost:', simulation.minResourceFee);
```

## Helper Functions

### Convert Values to ScVal

```typescript
import {
  addressToScVal,  // Stellar address
  u64ToScVal,      // Unsigned 64-bit integer
  i64ToScVal,      // Signed 64-bit integer
  u32ToScVal,      // Unsigned 32-bit integer
  i32ToScVal,      // Signed 32-bit integer
  symbolToScVal,   // Symbol (string)
  boolToScVal,     // Boolean
  bytesToScVal,    // Bytes (Buffer)
  toScVal,         // Auto-detect type
} from './blockchain';

// Examples
const args = [
  addressToScVal('GADDRESS...'),
  u64ToScVal(1000000n),
  symbolToScVal('transfer'),
  boolToScVal(true),
];
```

### Convert ScVal to JavaScript

```typescript
import { fromScVal } from './blockchain';

const balance = fromScVal(result.result);
console.log('Balance:', balance);
```

## Error Handling

```typescript
const result = await writeContract('transfer', args);

if (!result.success) {
  switch (result.errorType) {
    case 'OUT_OF_GAS':
      console.error('Increase resource limits');
      break;
    case 'SIMULATION_FAILED':
      console.error('Check arguments:', result.error);
      break;
    case 'TRANSACTION_FAILED':
      console.error('Transaction failed:', result.error);
      break;
  }
}
```

## Network Configuration

```typescript
import { SmartContractService } from './blockchain';

// Testnet (default)
const testnet = new SmartContractService('TESTNET');

// Mainnet
const mainnet = new SmartContractService('MAINNET');

// Futurenet
const futurenet = new SmartContractService('FUTURENET');
```

## Troubleshooting

### "Wallet not connected"
→ Install Freighter or Albedo and unlock it

### "Simulation failed"
→ Check contract ID, method name, and argument types

### "Out of gas"
→ Contract operation too expensive, optimize or increase limits

### "Transaction timeout"
→ Network congestion, retry after a few seconds

## Next Steps

1. Read the [full documentation](./README.md)
2. Check [usage examples](./examples/contractUsage.ts)
3. Review [testing guide](./TESTING.md)
4. Try the [demo component](./components/SorobanDemo.tsx)

## Support

- [Stellar Soroban Docs](https://soroban.stellar.org/docs)
- [Stellar SDK Docs](https://stellar.github.io/js-stellar-sdk/)
- [Freighter Docs](https://docs.freighter.app/)
- [Stellar Discord](https://discord.gg/stellar)

---

**You're ready to build with Soroban!** 🚀
