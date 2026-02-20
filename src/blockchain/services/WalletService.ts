/**
 * WalletService - Integration with Stellar wallets (Freighter, Albedo)
 * 
 * Provides secure transaction signing without accessing private keys
 */

export enum WalletType {
    FREIGHTER = 'FREIGHTER',
    ALBEDO = 'ALBEDO',
}

export interface WalletInfo {
    publicKey: string;
    type: WalletType;
    isConnected: boolean;
}

declare global {
    interface Window {
        freighter?: {
            isConnected: () => Promise<boolean>;
            getPublicKey: () => Promise<string>;
            signTransaction: (xdr: string, options?: any) => Promise<string>;
            getNetwork: () => Promise<string>;
        };
        albedo?: {
            publicKey: (options?: any) => Promise<{ pubkey: string }>;
            tx: (options: { xdr: string; network?: string }) => Promise<{ signed_envelope_xdr: string }>;
        };
    }
}

export class WalletService {
    private connectedWallet: WalletInfo | null = null;

    /**
     * Check if Freighter wallet is available
     */
    isFreighterAvailable(): boolean {
        return typeof window !== 'undefined' && !!window.freighter;
    }

    /**
     * Check if Albedo wallet is available
     */
    isAlbedoAvailable(): boolean {
        return typeof window !== 'undefined' && !!window.albedo;
    }

    /**
     * Connect to Freighter wallet
     */
    async connectFreighter(): Promise<WalletInfo | null> {
        try {
            if (!this.isFreighterAvailable()) {
                throw new Error('Freighter wallet not installed');
            }

            const isConnected = await window.freighter!.isConnected();
            if (!isConnected) {
                throw new Error('Freighter wallet not connected');
            }

            const publicKey = await window.freighter!.getPublicKey();

            this.connectedWallet = {
                publicKey,
                type: WalletType.FREIGHTER,
                isConnected: true,
            };

            return this.connectedWallet;
        } catch (error) {
            console.error('Error connecting to Freighter:', error);
            return null;
        }
    }

    /**
     * Connect to Albedo wallet
     */
    async connectAlbedo(): Promise<WalletInfo | null> {
        try {
            if (!this.isAlbedoAvailable()) {
                throw new Error('Albedo wallet not available');
            }

            const result = await window.albedo!.publicKey();

            this.connectedWallet = {
                publicKey: result.pubkey,
                type: WalletType.ALBEDO,
                isConnected: true,
            };

            return this.connectedWallet;
        } catch (error) {
            console.error('Error connecting to Albedo:', error);
            return null;
        }
    }

    /**
     * Sign transaction with connected wallet
     */
    async signTransaction(xdr: string, network?: string): Promise<string> {
        if (!this.connectedWallet) {
            throw new Error('No wallet connected');
        }

        try {
            if (this.connectedWallet.type === WalletType.FREIGHTER) {
                return await this.signWithFreighter(xdr, network);
            } else if (this.connectedWallet.type === WalletType.ALBEDO) {
                return await this.signWithAlbedo(xdr, network);
            }

            throw new Error('Unsupported wallet type');
        } catch (error) {
            console.error('Error signing transaction:', error);
            throw error;
        }
    }

    /**
     * Sign transaction with Freighter
     */
    private async signWithFreighter(xdr: string, network?: string): Promise<string> {
        if (!window.freighter) {
            throw new Error('Freighter not available');
        }

        const options = network ? { network } : undefined;
        return await window.freighter.signTransaction(xdr, options);
    }

    /**
     * Sign transaction with Albedo
     */
    private async signWithAlbedo(xdr: string, network?: string): Promise<string> {
        if (!window.albedo) {
            throw new Error('Albedo not available');
        }

        const result = await window.albedo.tx({
            xdr,
            network: network || 'testnet',
        });

        return result.signed_envelope_xdr;
    }

    /**
     * Get connected wallet info
     */
    getConnectedWallet(): WalletInfo | null {
        return this.connectedWallet;
    }

    /**
     * Disconnect wallet
     */
    disconnect(): void {
        this.connectedWallet = null;
    }

    /**
     * Auto-detect and connect to available wallet
     */
    async autoConnect(): Promise<WalletInfo | null> {
        // Try Freighter first
        if (this.isFreighterAvailable()) {
            const wallet = await this.connectFreighter();
            if (wallet) return wallet;
        }

        // Try Albedo as fallback
        if (this.isAlbedoAvailable()) {
            const wallet = await this.connectAlbedo();
            if (wallet) return wallet;
        }

        return null;
    }
}

// Export singleton instance
export const walletService = new WalletService();
