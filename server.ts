import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory log of PayDunya webhook events for admin monitoring
interface PayDunyaWebhookLog {
  id: string;
  orderNumber: string;
  token: string;
  amount: number;
  status: string;
  receivedAt: string;
  source: 'real_ipn' | 'api_confirm' | 'simulation';
  payload: unknown;
}

const paydunyaLogs: PayDunyaWebhookLog[] = [
  {
    id: 'pd-log-1',
    orderNumber: 'TT-2026-8492',
    token: 'tok_sandbox_tt20268492_394821',
    amount: 345000,
    status: 'completed',
    receivedAt: '14:25:30',
    source: 'simulation',
    payload: { status: 'completed', message: 'PayDunya Sandbox Wave Payment Success' },
  },
];

// Map des factures confirmées en temps réel par Webhook IPN ou API Confirm
const confirmedInvoices = new Map<
  string,
  {
    status: string;
    orderNumber: string;
    amount: number;
    confirmedAt: string;
    hashVerified: boolean;
    receiptUrl?: string;
  }
>();

/**
 * Résout l'URL publique de base de l'application pour les callbacks IPN
 */
function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

/**
 * Normalise la variable PAYDUNYA_MODE pour tolérer 'Mode test', 'test', 'sandbox', 'live', etc.
 */
function normalizePayDunyaMode(rawMode?: string): 'test' | 'live' {
  if (!rawMode) return 'test';
  const clean = rawMode.trim().toLowerCase();
  if (clean.includes('live') || clean.includes('prod')) {
    return 'live';
  }
  // Tolère 'test', 'mode test', 'sandbox', 'dev', etc.
  return 'test';
}

// État mémoire de configuration PayDunya (initialisé depuis .env avec tolérance aux variantes)
const paydunyaConfigState = {
  rawMode: process.env.PAYDUNYA_MODE || 'test',
  mode: normalizePayDunyaMode(process.env.PAYDUNYA_MODE),
  masterKey: (process.env.PAYDUNYA_MASTER_KEY || '').trim(),
  privateKey: (process.env.PAYDUNYA_PRIVATE_KEY || '').trim(),
  publicKey: (process.env.PAYDUNYA_PUBLIC_KEY || '').trim(),
  token: (process.env.PAYDUNYA_TOKEN || '').trim(),
};

/**
 * Route : Information sur la configuration PayDunya (Mode Test / Sandbox ou Live)
 */
app.get('/api/paydunya/config', (req, res) => {
  const isMasterKeySet = Boolean(paydunyaConfigState.masterKey);
  const isPrivateKeySet = Boolean(paydunyaConfigState.privateKey);
  const isTokenSet = Boolean(paydunyaConfigState.token);
  const isTest = paydunyaConfigState.mode === 'test';
  const baseUrl = getBaseUrl(req);

  res.json({
    gateway: 'PayDunya Sénégal',
    mode: paydunyaConfigState.mode, // Toujours 'test' ou 'live'
    rawMode: paydunyaConfigState.rawMode, // Valeur brute saisie par l'utilisateur (ex: "Mode test")
    isTest,
    modeLabel: isTest ? 'Mode Test (Sandbox)' : 'Mode Production (Live)',
    modeNote: 'Tolérance active : "test", "Mode test", "sandbox" sont tous acceptés et automatiquement normalisés.',
    apiUrl: isTest
      ? 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'
      : 'https://app.paydunya.com/api/v1/checkout-invoice/create',
    checkoutUrl: isTest
      ? 'https://app.paydunya.com/sandbox-checkout/invoice'
      : 'https://app.paydunya.com/checkout/invoice',
    callbackUrl: `${baseUrl}/api/paydunya/webhook`,
    isConfigured: isMasterKeySet && isPrivateKeySet && isTokenSet,
    keysStatus: {
      masterKey: isMasterKeySet ? `${paydunyaConfigState.masterKey.slice(0, 4)}•••• (${paydunyaConfigState.masterKey.length} car.)` : 'Non configuré',
      privateKey: isPrivateKeySet ? `${paydunyaConfigState.privateKey.slice(0, 4)}•••• (${paydunyaConfigState.privateKey.length} car.)` : 'Non configuré',
      token: isTokenSet ? `${paydunyaConfigState.token.slice(0, 4)}•••• (${paydunyaConfigState.token.length} car.)` : 'Non configuré',
      publicKey: paydunyaConfigState.publicKey ? `${paydunyaConfigState.publicKey.slice(0, 4)}•••• (${paydunyaConfigState.publicKey.length} car.)` : 'Non configuré',
    },
  });
});

/**
 * Route : Mise à jour dynamique de la configuration PayDunya (changement de mode ou de clés)
 */
app.post('/api/paydunya/config', (req, res) => {
  try {
    const { mode, masterKey, privateKey, publicKey, token } = req.body;
    if (mode !== undefined) {
      paydunyaConfigState.rawMode = String(mode);
      paydunyaConfigState.mode = normalizePayDunyaMode(String(mode));
    }
    if (masterKey !== undefined) paydunyaConfigState.masterKey = String(masterKey).trim();
    if (privateKey !== undefined) paydunyaConfigState.privateKey = String(privateKey).trim();
    if (publicKey !== undefined) paydunyaConfigState.publicKey = String(publicKey).trim();
    if (token !== undefined) paydunyaConfigState.token = String(token).trim();

    return res.json({
      success: true,
      message: `Configuration PayDunya mise à jour (${paydunyaConfigState.mode === 'test' ? 'Mode Test / Sandbox' : 'Mode Production Live'})`,
      mode: paydunyaConfigState.mode,
      rawMode: paydunyaConfigState.rawMode,
    });
  } catch (error) {
    return res.status(400).json({ error: 'Erreur lors de la mise à jour de la configuration PayDunya' });
  }
});

/**
 * Route : Test direct de connexion avec les clés PayDunya fournies
 */
app.post('/api/paydunya/test-connection', async (req, res) => {
  const masterKey = (req.body?.masterKey ? String(req.body.masterKey).trim() : paydunyaConfigState.masterKey);
  const privateKey = (req.body?.privateKey ? String(req.body.privateKey).trim() : paydunyaConfigState.privateKey);
  const tokenKey = (req.body?.token ? String(req.body.token).trim() : paydunyaConfigState.token);
  const modeToUse = req.body?.mode ? normalizePayDunyaMode(String(req.body.mode)) : paydunyaConfigState.mode;
  const isTest = modeToUse === 'test';

  if (!masterKey || !privateKey || !tokenKey) {
    return res.status(400).json({
      success: false,
      message: 'Veuillez renseigner la Master Key, Private Key et Token pour tester.',
    });
  }

  const apiUrl = isTest
    ? 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'
    : 'https://app.paydunya.com/api/v1/checkout-invoice/create';

  try {
    const probeRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateKey,
        'PAYDUNYA-TOKEN': tokenKey,
      },
      body: JSON.stringify({
        invoice: { total_amount: 1000, description: 'Test Connexion API TerangaMall' },
        store: { name: 'TerangaMall Test' },
      }),
    });

    const data = await probeRes.json().catch(() => ({}));

    if (data.response_code === '00') {
      return res.json({
        success: true,
        message: `✅ Connexion réussie à PayDunya ${isTest ? 'Sandbox (Test)' : 'Production'} ! Vos clés sont valides.`,
        responseCode: data.response_code,
        token: data.token,
        responseUrl: data.response_url,
      });
    } else {
      return res.json({
        success: false,
        message: data.response_text || `Erreur PayDunya code ${data.response_code}`,
        responseCode: data.response_code,
        details: data,
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `Impossible de joindre l'API PayDunya : ${err?.message || err}`,
    });
  }
});

/**
 * Route : Création d'une facture PayDunya Checkout (Mode Sandbox Test ou Live)
 * Appelle l'API PayDunya pour créer la facture et générer l'URL officielle de paiement.
 */
app.post('/api/paydunya/create-invoice', async (req, res) => {
  try {
    const { orderId, orderNumber, amount, customerName, customerPhone, customerEmail, description } = req.body;

    const masterKey = paydunyaConfigState.masterKey;
    const privateKey = paydunyaConfigState.privateKey;
    const tokenKey = paydunyaConfigState.token;
    const isTest = paydunyaConfigState.mode === 'test';
    const baseUrl = getBaseUrl(req);

    const apiUrl = isTest
      ? 'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create'
      : 'https://app.paydunya.com/api/v1/checkout-invoice/create';

    const baseCheckoutUrl = isTest
      ? 'https://app.paydunya.com/sandbox-checkout/invoice'
      : 'https://app.paydunya.com/checkout/invoice';

    const cancelUrl = `${baseUrl}/#/order-tracking?orderId=${orderId}&paydunya_status=cancelled`;
    const returnUrl = `${baseUrl}/#/order-tracking?orderId=${orderId}&paydunya_status=success`;
    const callbackUrl = `${baseUrl}/api/paydunya/webhook`;

    // Si les clés officielles sont configurées
    if (masterKey && privateKey && tokenKey) {
      try {
        const paydunyaPayload = {
          invoice: {
            total_amount: Math.round(Number(amount)),
            description: description || `Commande TerangaMall ${orderNumber}`,
          },
          store: {
            name: 'TerangaMall',
            tagline: 'Marketplace N°1 au Sénégal',
            postal_address: 'Point E, Dakar, Sénégal',
            phone: '+221338000000',
            website_url: baseUrl,
          },
          actions: {
            cancel_url: cancelUrl,
            return_url: returnUrl,
            callback_url: callbackUrl,
          },
          custom_data: {
            order_id: orderId,
            order_number: orderNumber,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
          },
        };

        const apiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PAYDUNYA-MASTER-KEY': masterKey,
            'PAYDUNYA-PRIVATE-KEY': privateKey,
            'PAYDUNYA-TOKEN': tokenKey,
          },
          body: JSON.stringify(paydunyaPayload),
        });

        const apiData = await apiRes.json().catch(() => ({}));

        if (apiData.response_code === '00' && apiData.token) {
          return res.json({
            success: true,
            response_code: '00',
            response_text: apiData.response_text || 'Invoice created successfully',
            token: apiData.token,
            response_url: apiData.response_url || `${baseCheckoutUrl}/${apiData.token}`,
            mode: paydunyaConfigState.mode,
            isRealApi: true,
          });
        } else if (apiData.response_code && apiData.response_code !== '00') {
          // PayDunya a répondu avec une erreur explicite (ex: 1001 Invalid Masterkey)
          console.warn('[PayDunya Error Response]', apiData);
          return res.status(400).json({
            success: false,
            response_code: apiData.response_code,
            response_text: apiData.response_text || 'Erreur retournée par PayDunya',
            message: `Erreur API PayDunya (${apiData.response_code}) : ${apiData.response_text || 'Vérifiez vos clés de test dans l\'administration'}.`,
            mode: paydunyaConfigState.mode,
          });
        }
      } catch (externalErr: any) {
        console.warn('Appel API PayDunya externe échoué:', externalErr);
      }
    }

    // Si les clés ne sont pas encore configurées ou invalides
    return res.status(400).json({
      success: false,
      response_code: 'MISSING_KEYS',
      response_text: 'Clés PayDunya non configurées',
      message: 'Veuillez configurer vos clés PayDunya Sandbox dans l\'administration (onglet Passerelles).',
      mode: paydunyaConfigState.mode,
    });
  } catch (error: any) {
    console.error('Erreur create-invoice PayDunya:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la création de la facture PayDunya' });
  }
});

/**
 * Route : Vérification du statut d'une facture PayDunya (Interrogation IPN + API Confirm)
 */
app.get('/api/paydunya/check-status/:token', async (req, res) => {
  const token = req.params.token;
  if (!token) return res.status(400).json({ error: 'Token manquant' });

  // 1. Vérification dans le cache local (notifié par vrai IPN webhook)
  if (confirmedInvoices.has(token)) {
    const info = confirmedInvoices.get(token)!;
    return res.json({
      confirmed: true,
      status: info.status,
      orderNumber: info.orderNumber,
      amount: info.amount,
      confirmedAt: info.confirmedAt,
      receiptUrl: info.receiptUrl,
      source: 'real_ipn_webhook',
    });
  }

  // 2. Interrogation directe de l'API PayDunya (Endpoint confirm)
  const isTest = paydunyaConfigState.mode === 'test';
  const confirmApiUrl = isTest
    ? `https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${token}`
    : `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${token}`;

  const masterKey = paydunyaConfigState.masterKey;
  const privateKey = paydunyaConfigState.privateKey;
  const tokenKey = paydunyaConfigState.token;

  if (masterKey && privateKey && tokenKey) {
    try {
      const confirmRes = await fetch(confirmApiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': masterKey,
          'PAYDUNYA-PRIVATE-KEY': privateKey,
          'PAYDUNYA-TOKEN': tokenKey,
        },
      });

      if (confirmRes.ok) {
        const confirmData = await confirmRes.json();
        const invoiceStatus = (confirmData?.status || confirmData?.invoice?.status || '').toLowerCase();
        const isPaid = invoiceStatus === 'completed';

        if (isPaid) {
          const orderNum = confirmData?.custom_data?.order_number || confirmData?.order_number || '';
          const receipt = confirmData?.receipt_url || confirmData?.invoice?.receipt_url;
          confirmedInvoices.set(token, {
            status: 'completed',
            orderNumber: orderNum,
            amount: Number(confirmData?.invoice?.total_amount || confirmData?.total_amount || 0),
            confirmedAt: new Date().toLocaleTimeString('fr-FR'),
            hashVerified: true,
            receiptUrl: receipt,
          });

          return res.json({
            confirmed: true,
            status: 'completed',
            orderNumber: orderNum,
            amount: Number(confirmData?.invoice?.total_amount || 0),
            receiptUrl: receipt,
            source: 'paydunya_api_confirm',
          });
        }

        return res.json({
          confirmed: false,
          status: invoiceStatus || 'pending',
          source: 'paydunya_api_confirm',
        });
      }
    } catch (e) {
      console.warn('Erreur vérification API confirm PayDunya:', e);
    }
  }

  return res.json({ confirmed: false, status: 'pending' });
});

/**
 * Route : IPN Webhook PayDunya (Notification instantanée de paiement réel)
 * Gère le format application/json et application/x-www-form-urlencoded
 */
app.post('/api/paydunya/webhook', (req, res) => {
  try {
    const rawData = req.body?.data || req.body;
    let data = rawData;
    if (typeof rawData === 'string') {
      try {
        data = JSON.parse(rawData);
      } catch {
        data = req.body;
      }
    }

    const status = (data?.status || req.body?.status || 'completed').toLowerCase();
    const token = data?.invoice?.token || data?.token || req.body?.['data[invoice][token]'] || `tok_${Date.now()}`;
    const orderNumber = data?.custom_data?.order_number || data?.order_number || req.body?.['data[custom_data][order_number]'] || 'TT-COMMANDE';
    const amount = Number(data?.invoice?.total_amount || data?.amount || req.body?.['data[invoice][total_amount]'] || 0);
    const receiptUrl = data?.receipt_url || data?.invoice?.receipt_url || `https://app.paydunya.com/sandbox-receipt/pdf/${token}`;
    const receivedHash = data?.hash || req.body?.hash || req.body?.['data[hash]'];

    // Vérification Hash SHA-512 si MasterKey est présente
    let hashVerified = true;
    if (paydunyaConfigState.masterKey && receivedHash) {
      const expectedHash = crypto
        .createHash('sha512')
        .update(paydunyaConfigState.masterKey)
        .digest('hex');
      hashVerified = receivedHash === expectedHash;
    }

    const logEntry: PayDunyaWebhookLog = {
      id: `pd-wh-${Date.now()}`,
      orderNumber,
      token,
      amount,
      status,
      receivedAt: new Date().toLocaleTimeString('fr-FR'),
      source: 'real_ipn',
      payload: req.body,
    };

    paydunyaLogs.unshift(logEntry);
    if (paydunyaLogs.length > 50) paydunyaLogs.pop();

    if (status === 'completed' && hashVerified) {
      confirmedInvoices.set(token, {
        status: 'completed',
        orderNumber,
        amount,
        confirmedAt: logEntry.receivedAt,
        hashVerified: true,
        receiptUrl,
      });
      console.log(`[PayDunya IPN Validé] Facture ${token} payée (${amount} FCFA) pour commande ${orderNumber}`);
    }

    // Réponse HTTP 200 conforme à la spécification IPN PayDunya
    return res.json({
      success: true,
      message: 'Notification IPN PayDunya traitée avec succès',
      status,
      token,
      hashVerified,
    });
  } catch (error) {
    console.error('Erreur webhook PayDunya:', error);
    return res.status(400).json({ error: 'Format IPN invalide' });
  }
});

/**
 * Route : Récupération des logs de Webhook PayDunya pour l'administration
 */
app.get('/api/paydunya/logs', (_req, res) => {
  res.json({ logs: paydunyaLogs });
});

// En production, servir les fichiers statiques de Vite compilés
// En développement, monter Vite en middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TerangaMall server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
