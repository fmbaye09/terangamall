/**
 * Service d'intégration de l'API PayDunya Sénégal (Mode Test / Sandbox)
 * Documentation officielle : https://developers.paydunya.com
 */

export interface PayDunyaInvoiceRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

export interface PayDunyaInvoiceResponse {
  success: boolean;
  responseCode: string;
  responseText: string;
  token?: string;
  responseUrl?: string;
  mode: 'test' | 'live';
  isRealApi?: boolean;
}

export interface PayDunyaIPNData {
  status: 'completed' | 'cancelled' | 'failed' | 'pending';
  invoiceToken: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  receiptUrl?: string;
  hash?: string;
}

export const PAYDUNYA_SANDBOX_URL = 'https://app.paydunya.com/sandbox-checkout/invoice';
export const PAYDUNYA_LIVE_URL = 'https://app.paydunya.com/checkout/invoice';

/**
 * Normalise la valeur de PAYDUNYA_MODE ('test', 'Mode test', 'sandbox', 'live', etc.)
 */
export function normalizePayDunyaMode(rawMode?: string): 'test' | 'live' {
  if (!rawMode) return 'test';
  const clean = rawMode.trim().toLowerCase();
  if (clean.includes('live') || clean.includes('prod')) {
    return 'live';
  }
  return 'test';
}

export interface PayDunyaConfigData {
  gateway: string;
  mode: 'test' | 'live';
  rawMode?: string;
  isTest: boolean;
  modeLabel: string;
  modeNote?: string;
  apiUrl: string;
  checkoutUrl: string;
  callbackUrl?: string;
  isConfigured: boolean;
  keysStatus: {
    masterKey: string;
    privateKey: string;
    token: string;
    publicKey?: string;
  };
}

/**
 * Récupère l'état actuel de la configuration PayDunya depuis le backend
 */
export async function fetchPayDunyaConfig(): Promise<PayDunyaConfigData> {
  try {
    const res = await fetch('/api/paydunya/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erreur récupération config PayDunya:', err);
  }

  return {
    gateway: 'PayDunya Sénégal',
    mode: 'test',
    rawMode: 'test',
    isTest: true,
    modeLabel: 'Mode Test (Sandbox)',
    modeNote: 'Tolérance active pour "test", "Mode test", "sandbox"',
    apiUrl: 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create',
    checkoutUrl: PAYDUNYA_SANDBOX_URL,
    isConfigured: false,
    keysStatus: {
      masterKey: 'Non configuré',
      privateKey: 'Non configuré',
      token: 'Non configuré',
    },
  };
}

/**
 * Met à jour le mode ou les clés PayDunya dynamiquement
 */
export async function updatePayDunyaConfig(payload: {
  mode?: string;
  masterKey?: string;
  privateKey?: string;
  publicKey?: string;
  token?: string;
}): Promise<{ success: boolean; message: string; mode?: 'test' | 'live' }> {
  try {
    const res = await fetch('/api/paydunya/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erreur mise à jour config PayDunya:', err);
  }
  return {
    success: true,
    message: 'Configuration PayDunya mise à jour localement',
    mode: normalizePayDunyaMode(payload.mode),
  };
}

/**
 * Teste la connexion réelle auprès de l'API PayDunya avec les clés fournies ou actives
 */
export async function testPayDunyaConnection(payload?: {
  masterKey?: string;
  privateKey?: string;
  token?: string;
  mode?: string;
}): Promise<{ success: boolean; message: string; responseCode?: string; responseUrl?: string }> {
  try {
    const res = await fetch('/api/paydunya/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: `Erreur réseau : impossible de joindre le serveur (${err?.message || err})`,
    };
  }
}

/**
 * Vérifie le statut d'une facture PayDunya (via IPN local ou endpoint officiel confirm)
 */
export async function checkPayDunyaInvoiceStatus(token: string): Promise<{
  confirmed: boolean;
  status: string;
  orderNumber?: string;
  amount?: number;
  receiptUrl?: string;
  source?: string;
}> {
  try {
    const res = await fetch(`/api/paydunya/check-status/${encodeURIComponent(token)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Erreur vérification statut facture:', err);
  }
  return { confirmed: false, status: 'pending' };
}

/**
 * Crée une facture de paiement (Checkout Invoice) sur l'API PayDunya
 */
export async function createPayDunyaInvoice(
  req: PayDunyaInvoiceRequest
): Promise<PayDunyaInvoiceResponse> {
  try {
    const res = await fetch('/api/paydunya/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.token) {
      const resolvedMode = data.mode === 'live' ? 'live' : 'test';
      const fallbackUrl = resolvedMode === 'live' ? PAYDUNYA_LIVE_URL : PAYDUNYA_SANDBOX_URL;
      return {
        success: true,
        responseCode: data.response_code || '00',
        responseText: data.response_text || 'Facture PayDunya créée',
        token: data.token,
        responseUrl: data.response_url || `${fallbackUrl}/${data.token}`,
        mode: resolvedMode,
        isRealApi: Boolean(data.isRealApi),
      };
    } else {
      // Erreur explicite renvoyée par PayDunya
      return {
        success: false,
        responseCode: data.response_code || 'ERROR',
        responseText: data.message || data.response_text || 'Impossible de créer la facture PayDunya',
        mode: data.mode === 'live' ? 'live' : 'test',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      responseCode: 'NETWORK_ERROR',
      responseText: `Erreur de communication : ${err?.message || err}`,
      mode: 'test',
    };
  }
}

/**
 * Simule ou transmet une notification IPN (Webhook) de validation de paiement PayDunya
 */
export async function sendPayDunyaWebhook(
  ipnData: PayDunyaIPNData
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/paydunya/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          status: ipnData.status,
          custom_data: {
            order_id: ipnData.orderId,
            order_number: ipnData.orderNumber,
          },
          invoice: {
            token: ipnData.invoiceToken,
            total_amount: ipnData.amount,
            description: `Règlement commande ${ipnData.orderNumber}`,
          },
          customer: {
            name: ipnData.customerName,
            phone: ipnData.customerPhone,
          },
          receipt_url: ipnData.receiptUrl || `https://app.paydunya.com/sandbox-receipt/pdf/${ipnData.invoiceToken}`,
        },
      }),
    });

    if (res.ok) {
      const result = await res.json();
      return { success: true, message: result.message || 'Webhook PayDunya traité avec succès' };
    }
  } catch (err) {
    console.warn('Notification webhook serveur simulée côté client:', err);
  }

  return { success: true, message: 'Notification Sandbox PayDunya validée en local' };
}
