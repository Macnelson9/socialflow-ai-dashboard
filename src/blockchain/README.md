# Soroban Contract Bridge

Smart contract integration for SocialFlow using Stellar's Soroban platform.

## Features

✅ **Read-Only Contract Calls** - Query contract state without wallet signature  
✅ **State-Changing Calls** - Execute transactions with wallet signature (Freighter/Albedo)  
✅ **Resource Estimation** - Automatic simulation before submission to calculate fees  
✅ **WASM Deployment** - Deploy smart contracts for admins  
✅ **Event Parsing** - Extract and parse execution events from transaction metadata  
✅ **Error Handling** - Proper handling of out-of-gas and other errors  
✅ **Multi-Network Support** - Testnet, Mainnet, and Futurenet  

## Architecture

```
src/blockchain/
├── services/
│   ├── SmartContractService.ts    # Core Soroban RPC interactions
│   └── WalletService.ts            # Wallet integration (Freighter/Albedo)
├── types/
│   └── soroban.ts                  # TypeScript interfaces
├── config/
│   └── soroban.config.ts           # Network configurations
├── utils/
│   └── sorobanHelpers.ts           # Helper functions for ScVal conversion
├── hooks/
│   └── useSorobanContract.ts       # React hook for easy integration
└── examples/
    └── contractUsage.ts            # Usage examples
```

## Installation

The required dependencies are already installed:

```bash
npm install @stellar/stellar-sdk
```

## Quick Start

### 1. Basic Contract Call (Read-Only)

```typescript
import { sorobanService } from './blockchain/services/SmartContractService';
import { ContractCallType } from './blockchain/types/soroban';
import { addressToScVal, fromScVal } from './blockchain/utils/sorobanHelpers';

// Read contract balance
const result = await sorobanService.invoke(
  {
    contractId: 'CCONTRACT_ID_HERE',
    method: 'balance',
    args: [addressToScVal('GUSER_ADDRESS_HERE')],
  },
  'GSOURCE_ACCOUNT_HERE',
  ContractCallType.READ_ONLY
);

if (result.success) {
  const balance = fromScVal(result.result);
  console.log('Balance:', balance);
}
```

### 2. State-Changing Call (Requires Signature)

```typescript
import { walletService } from './blockchain/services/WalletService';

// Connect wallet
const wallet = await walletService.autoConnect();

// Sign transaction function
const signTransaction = async (xdr: string) => {
  return await walletService.signTransaction(xdr, 'testnet');
};

// Transfer tokens
const result = await sorobanService.invoke(
  {
    contractId: 'CCONTRACT_ID_HERE',
    method: 'transfer',
    args: [
      addressToScVal(wallet.publicKey),
      addressToScVal('GRECIPIENT_HERE'),
      u64ToScVal(1000000n),
    ],
  },
  wallet.publicKey,
  ContractCallType.STATE_CHANGING,
  signTransaction
);

if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
  console.log('Events:', result.events);
}
```

### 3. Using React Hook

```typescript
import { useSorobanContract } from './blockchain/hooks/useSorobanContract';
import { addressToScVal, u64ToScVal } from './blockchain/utils/sorobanHelpers';

function MyComponent() {
  const {
    wallet,
    isLoading,
    error,
    connectWallet,
    readContract,
    writeContract,
  } = useSorobanContract('CCONTRACT_ID_HERE', 'TESTNET');

  const handleConnect = async () => {
    await connectWallet();
  };

  const handleTransfer = async () => {
    try {
      const result = await writeContract('transfer', [
        addressToScVal(wallet!.publicKey),
        addressToScVal('GRECIPIENT_HERE'),
        u64ToScVal(1000000n),
      ]);
      
      console.log('Success!', result.transactionHash);
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  return (
    <div>
      {!wallet ? (
        <button onClick={handleConnect}>Connect Wallet</button>
      ) : (
        <button onClick={handleTransfer} disabled={isLoading}>
          Transfer Tokens
        </button>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## API Reference

### SmartContractService

#### `simulate(params, sourceAccount)`
Simulate a contract call without submitting to the network.

**Returns:** `ContractSimulationResult` with cost estimation and result

#### `invoke(params, sourceAccount, callType, signTransaction?)`
Invoke a contract method (read-only or state-changing).

**Parameters:**
- `params`: Contract ID, method name, and arguments
- `sourceAccount`: Source account public key
- `callType`: `READ_ONLY` or `STATE_CHANGING`
- `signTransaction`: Optional signing function (required for state-changing)

**Returns:** `ContractInvocationResult`

#### `deployWasm(params, sourceAccount, signTransaction)`
Deploy a WASM contract.

**Returns:** `WasmDeploymentResult` with contract ID

#### `getContractEvents(contractId, startLedger?, endLedger?)`
Fetch contract events.

**Returns:** Array of `EventResponse`

### WalletService

#### `connectFreighter()`
Connect to Freighter wallet.

#### `connectAlbedo()`
Connect to Albedo wallet.

#### `autoConnect()`
Auto-detect and connect to available wallet.

#### `signTransaction(xdr, network?)`
Sign transaction with connected wallet.

## Error Handling

The service provides detailed error types:

- `OUT_OF_GAS` - Transaction exceeded resource limits
- `SIMULATION_FAILED` - Pre-flight simulation failed
- `TRANSACTION_FAILED` - Transaction submission or execution failed
- `UNKNOWN` - Unexpected error

```typescript
const result = await sorobanService.invoke(...);

if (!result.success) {
  switch (result.errorType) {
    case 'OUT_OF_GAS':
      console.error('Increase resource limits');
      break;
    case 'SIMULATION_FAILED':
      console.error('Check contract arguments:', result.error);
      break;
    default:
      console.error('Transaction failed:', result.error);
  }
}
```

## Network Configuration

Switch between networks:

```typescript
import { SmartContractService } from './blockchain/services/SmartContractService';

// Testnet (default)
const testnetService = new SmartContractService('TESTNET');

// Mainnet
const mainnetService = new SmartContractService('MAINNET');

// Futurenet
const futurenetService = new SmartContractService('FUTURENET');
```

## Helper Functions

### ScVal Conversion

```typescript
import {
  toScVal,
  fromScVal,
  addressToScVal,
  u64ToScVal,
  i64ToScVal,
  u32ToScVal,
  i32ToScVal,
  symbolToScVal,
  boolToScVal,
  bytesToScVal,
} from './blockchain/utils/sorobanHelpers';

// Convert JavaScript values to ScVal
const args = [
  addressToScVal('GADDRESS...'),
  u64ToScVal(1000000n),
  symbolToScVal('transfer'),
  boolToScVal(true),
];

// Convert ScVal back to JavaScript
const balance = fromScVal(result.result);
```

## Testing

See `src/blockchain/examples/contractUsage.ts` for comprehensive examples.

## Security Notes

- Private keys are NEVER accessed by the service
- All transaction signing is delegated to wallet providers (Freighter/Albedo)
- Simulation is performed before every state-changing call
- Resource limits are automatically calculated

## Acceptance Criteria

✅ Successful read-only contract call  
✅ State-changing call triggers wallet signature  
✅ Correct handling of out-of-gas errors  
✅ Event parsing from transaction metadata  
✅ WASM deployment for admins  
✅ Multi-network support (Testnet/Mainnet/Futurenet)  

## Next Steps

1. Integrate with SocialFlow dashboard UI
2. Add contract-specific wrappers for common operations
3. Implement event listeners for real-time updates
4. Add transaction history tracking
5. Create admin panel for WASM deployment

## Resources

- [Stellar Soroban Documentation](https://soroban.stellar.org/docs)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Freighter Wallet](https://www.freighter.app/)
- [Albedo Wallet](https://albedo.link/)
