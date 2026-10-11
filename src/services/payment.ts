import { PaymentMethodType, PaymentStatusType } from '../types';

export interface PaymentCreationRequest {
  orderId: string;
  amount: number;
  currency: 'XOF';
  method: PaymentMethodType;
  customerPhone: string;
  customerName: string;
}

export interface PaymentCreationResult {
  transactionId: string;
  providerReference: string;
  status: PaymentStatusType;
  checkoutInstruction: string;
  webhookSignature: string;
}

export interface WebhookPayload {
  event: 'payment.succeeded' | 'payment.failed' | 'payment.refunded';
  transactionId: string;
  providerReference: string;
  orderId: string;
  amount: number;
  provider: PaymentMethodType;
  signature: string;
  timestamp: string;
}

/**
 * Interface abstraite PaymentProvider permettant d'interchanger
 * Wave, Orange Money, PayTech, Stripe ou Paiement à la livraison
 * sans couplage fort avec le frontend.
 */
export interface IPaymentProvider {
  readonly providerName: PaymentMethodType;
  createPayment(req: PaymentCreationRequest): Promise<PaymentCreationResult>;
  verifyPayment(providerReference: string): Promise<{ verified: boolean; status: PaymentStatusType }>;
  refundPayment(providerReference: string, amount: number): Promise<{ refunded: boolean; status: PaymentStatusType }>;
  handleWebhook(payload: WebhookPayload): Promise<{ valid: boolean; newStatus: PaymentStatusType }>;
}

class SenegalUnifiedPaymentService implements IPaymentProvider {
  readonly providerName: PaymentMethodType;

  constructor(providerName: PaymentMethodType) {
    this.providerName = providerName;
  }

  async createPayment(req: PaymentCreationRequest): Promise<PaymentCreationResult> {
    const timestamp = Date.now();
    const prefix =
      req.method === 'WAVE'
        ? 'WV-SN'
        : req.method === 'ORANGE_MONEY'
        ? 'OM-SN'
        : req.method === 'CARD'
        ? 'CB-SN'
        : 'COD-SN';

    const providerReference = `${prefix}-${timestamp.toString().slice(-6)}`;
    const webhookSignature = `whsec_sn_${btoa(`${req.orderId}:${providerReference}:${req.amount}`)}`;

    const instructionMap: Record<PaymentMethodType, string> = {
      WAVE: `Notification push envoyée sur le compte Wave ${req.customerPhone}. Validation webhook serveur requise.`,
      ORANGE_MONEY: `Code USSD #144#391# initié pour ${req.customerPhone}. En attente de confirmation webhook Orange Money.`,
      CARD: `Transaction 3D Secure initialisée (${req.amount.toLocaleString('fr-FR')} FCFA).`,
      CASH_ON_DELIVERY: `Paiement à la livraison enregistré. Règlement auprès du livreur à Dakar / régions.`,
    };

    return {
      transactionId: `tx_${timestamp}`,
      providerReference,
      status: req.method === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PROCESSING',
      checkoutInstruction: instructionMap[req.method],
      webhookSignature,
    };
  }

  async verifyPayment(providerReference: string): Promise<{ verified: boolean; status: PaymentStatusType }> {
    const isCod = providerReference.startsWith('COD-');
    return {
      verified: !isCod,
      status: isCod ? 'PENDING' : 'PAID',
    };
  }

  async refundPayment(_providerReference: string, _amount: number): Promise<{ refunded: boolean; status: PaymentStatusType }> {
    return {
      refunded: true,
      status: 'REFUNDED',
    };
  }

  async handleWebhook(payload: WebhookPayload): Promise<{ valid: boolean; newStatus: PaymentStatusType }> {
    const expectedSig = `whsec_sn_${btoa(`${payload.orderId}:${payload.providerReference}:${payload.amount}`)}`;
    const isValid = payload.signature === expectedSig;

    if (!isValid) {
      return { valid: false, newStatus: 'FAILED' };
    }

    if (payload.event === 'payment.succeeded') {
      return { valid: true, newStatus: 'PAID' };
    }
    if (payload.event === 'payment.refunded') {
      return { valid: true, newStatus: 'REFUNDED' };
    }
    return { valid: true, newStatus: 'FAILED' };
  }
}

export function getPaymentProvider(method: PaymentMethodType): IPaymentProvider {
  return new SenegalUnifiedPaymentService(method);
}

export function formatFCFA(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR')} FCFA`;
}
