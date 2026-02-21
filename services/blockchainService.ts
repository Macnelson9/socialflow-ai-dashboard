import { Asset, PaymentFormData, PaymentSummary, TransactionStatus, PaymentRequest, RecurringPayment } from '../types';

// Mock blockchain service - replace with actual Stellar/blockchain integration
const GAS_FEE_PERCENTAGE = 0.01; // 1% estimated gas fee

export const validateRecipientAddress = (address: string): boolean => {
  // Stellar address validation: starts with 'G' and is 56 characters
  return /^G[A-Z2-7]{55}$/.test(address);
};

export const validateAmount = (amount: string, balance: number): { valid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (numAmount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  return { valid: true };
};

export const calculateGasFee = (amount: string): string => {
  const numAmount = parseFloat(amount);
  const fee = (numAmount * GAS_FEE_PERCENTAGE).toFixed(7);
  return fee;
};

export const generatePaymentSummary = (
  formData: PaymentFormData,
  asset: Asset
): PaymentSummary => {
  const estimatedGasFee = calculateGasFee(formData.amount);
  const totalCost = (parseFloat(formData.amount) + parseFloat(estimatedGasFee)).toFixed(7);

  return {
    recipientAddress: formData.recipientAddress,
    amount: formData.amount,
    asset,
    estimatedGasFee,
    totalCost,
    memo: formData.memo,
  };
};

export const submitPayment = async (summary: PaymentSummary): Promise<TransactionStatus> => {
  // Mock API call - replace with actual blockchain submission
  return new Promise((resolve) => {
    setTimeout(() => {
      const hash = `0x${Math.random().toString(16).slice(2)}`;
      resolve({
        id: `tx-${Date.now()}`,
        hash,
        status: 'success',
        timestamp: new Date(),
        amount: summary.amount,
        asset: summary.asset,
        recipientAddress: summary.recipientAddress,
      });
    }, 2000);
  });
};

export const getTransactionStatus = async (hash: string): Promise<TransactionStatus | null> => {
  // Mock API call - replace with actual blockchain query
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `tx-${Date.now()}`,
        hash,
        status: 'success',
        timestamp: new Date(),
        amount: '100',
        asset: { id: '1', symbol: 'USDC', name: 'USD Coin', balance: 1000, decimals: 6 },
        recipientAddress: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      });
    }, 1000);
  });
};

export const generateQRCode = async (paymentRequest: Omit<PaymentRequest, 'qrCode' | 'shareableLink'>): Promise<string> => {
  // Mock QR code generation - replace with actual QR library
  const data = JSON.stringify({
    recipient: paymentRequest.recipientAddress,
    amount: paymentRequest.amount,
    asset: paymentRequest.asset.symbol,
    memo: paymentRequest.memo,
  });
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12'%3E${encodeURIComponent(data.slice(0, 20))}...%3C/text%3E%3C/svg%3E`;
};

export const generateShareableLink = (paymentRequest: PaymentRequest): string => {
  const params = new URLSearchParams({
    recipient: paymentRequest.recipientAddress,
    amount: paymentRequest.amount,
    asset: paymentRequest.asset.id,
    memo: paymentRequest.memo || '',
  });
  return `${window.location.origin}?payment=${params.toString()}`;
};

export const calculateNextPaymentDate = (
  startDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly'
): Date => {
  const next = new Date(startDate);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
};

export const validateRecurringPayment = (
  payment: Omit<RecurringPayment, 'id' | 'nextPaymentDate' | 'isActive'>
): { valid: boolean; error?: string } => {
  if (!validateRecipientAddress(payment.recipientAddress)) {
    return { valid: false, error: 'Invalid recipient address' };
  }
  const amountValidation = validateAmount(payment.amount, payment.asset.balance);
  if (!amountValidation.valid) {
    return { valid: false, error: amountValidation.error };
  }
  if (payment.endDate && payment.endDate < payment.startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }
  return { valid: true };
};
