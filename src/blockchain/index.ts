/**
 * Soroban Contract Bridge - Main Export
 * 
 * Centralized exports for easy imports throughout the application
 */

// Services
export { SmartContractService, sorobanService } from './services/SmartContractService';
export { WalletService, walletService, WalletType } from './services/WalletService';

// Types
export type {
    ContractInvocationParams,
    ContractSimulationResult,
    ContractInvocationResult,
    WasmDeploymentParams,
    WasmDeploymentResult,
    SorobanConfig,
} from './types/soroban';

export { ContractCallType } from './types/soroban';

export type { WalletInfo } from './services/WalletService';

// Config
export { SOROBAN_NETWORKS, DEFAULT_TIMEOUT, DEFAULT_FEE } from './config/soroban.config';

// Utils
export {
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
    parseContractError,
    stroopsToXlm,
    xlmToStroops,
} from './utils/sorobanHelpers';

// Hooks
export { useSorobanContract } from './hooks/useSorobanContract';

// Examples (for reference)
export * from './examples/contractUsage';
