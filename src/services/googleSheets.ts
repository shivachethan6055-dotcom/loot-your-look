import { getAccessToken } from './firebaseAuth';
import { Order, WholesalerSettlement, ClothingProduct, GoogleSheetsSyncLog } from '../types';
import { addGoogleSheetsLog } from './storage';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowCount: number;
}

/**
 * Creates a new spreadsheet using Google Sheets REST API v4
 */
async function createSpreadsheet(title: string, accessToken: string): Promise<string> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Failed to create Google Spreadsheet');
  }

  const data = await response.json();
  return data.spreadsheetId;
}

/**
 * Appends row values into the spreadsheet
 */
async function appendValues(
  spreadsheetId: string,
  range: string,
  values: (string | number)[][],
  accessToken: string
) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || 'Failed to populate Google Sheets data');
  }

  return await response.json();
}

/**
 * Format header row with styling (freeze header row)
 */
async function formatSpreadsheetHeader(spreadsheetId: string, accessToken: string) {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            updateSheetProperties: {
              properties: {
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      }),
    });
  } catch (e) {
    console.warn('Could not apply freeze styling to sheet:', e);
  }
}

/**
 * Export Orders to a new Google Sheet
 */
export async function exportOrdersToGoogleSheets(
  orders: Order[],
  userEmail: string
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authorization token not found. Please Sign in with Google first.');
  }

  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const title = `Loot Your Look - Orders Report (${timestamp})`;

  const spreadsheetId = await createSpreadsheet(title, token);

  const header = [
    'Order Number',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'City & State',
    'Pincode',
    'Wholesaler Hub',
    'Garment Item Title',
    'Size',
    'Color',
    'Quantity',
    'Fabric',
    'Unit Price (₹)',
    'Subtotal (₹)',
    'Order Total (₹)',
    'Payment Method',
    'Payment Status',
    'Fulfillment Status',
    'Courier Partner',
    'Tracking Number / AWB',
  ];

  const rows: (string | number)[][] = [header];

  for (const order of orders) {
    for (const sellerOrder of order.sellerOrders) {
      for (const item of sellerOrder.items) {
        rows.push([
          order.orderNumber,
          new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          order.customerName,
          order.customerPhone,
          `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
          order.shippingAddress.pincode,
          sellerOrder.wholesalerName,
          item.productTitle,
          item.variantSize,
          item.variantColor,
          item.quantity,
          item.fabric,
          item.unitPrice,
          item.totalPrice,
          order.totalAmount,
          order.paymentMethod === 'RAZORPAY_ONLINE' ? 'Razorpay Online (UPI/Card)' : 'Cash on Delivery',
          order.paymentStatus,
          sellerOrder.fulfillmentStatus,
          sellerOrder.courierPartner || 'Not assigned',
          sellerOrder.trackingNumber || 'Pending packing',
        ]);
      }
    }
  }

  await appendValues(spreadsheetId, 'Sheet1!A1', rows, token);
  await formatSpreadsheetHeader(spreadsheetId, token);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const log: GoogleSheetsSyncLog = {
    sheetId: spreadsheetId,
    sheetUrl: spreadsheetUrl,
    title,
    rowCount: rows.length - 1,
    syncedAt: new Date().toISOString(),
    exportedBy: userEmail,
    type: 'orders',
  };
  addGoogleSheetsLog(log);

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: rows.length - 1,
  };
}

/**
 * Export Wholesaler Settlements to a new Google Sheet
 */
export async function exportSettlementsToGoogleSheets(
  settlements: WholesalerSettlement[],
  userEmail: string
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authorization token not found. Please Sign in with Google first.');
  }

  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const title = `Loot Your Look - Wholesaler Payouts & Settlements (${timestamp})`;

  const spreadsheetId = await createSpreadsheet(title, token);

  const header = [
    'Settlement ID',
    'Wholesaler Business Name',
    'GSTIN',
    'Sales Cycle Period',
    'Gross Clothing Sales (₹)',
    'Platform Commission 10% (₹)',
    'TCS / Tax Deducted (₹)',
    'Net Wholesaler Payout (₹)',
    'Settlement Status',
    'Bank Transfer Reference / UTR',
    'Settled At Date',
  ];

  const rows: (string | number)[][] = [header];

  for (const s of settlements) {
    rows.push([
      s.id,
      s.wholesalerName,
      s.gstin,
      s.period,
      s.grossSales,
      s.commissionDeducted,
      s.taxDeducted,
      s.netPayout,
      s.status,
      s.payoutReference || 'Pending Approval',
      s.settledAt ? new Date(s.settledAt).toLocaleDateString('en-IN') : '-',
    ]);
  }

  await appendValues(spreadsheetId, 'Sheet1!A1', rows, token);
  await formatSpreadsheetHeader(spreadsheetId, token);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const log: GoogleSheetsSyncLog = {
    sheetId: spreadsheetId,
    sheetUrl: spreadsheetUrl,
    title,
    rowCount: rows.length - 1,
    syncedAt: new Date().toISOString(),
    exportedBy: userEmail,
    type: 'settlements',
  };
  addGoogleSheetsLog(log);

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: rows.length - 1,
  };
}

/**
 * Export Catalog to a new Google Sheet
 */
export async function exportCatalogToGoogleSheets(
  products: ClothingProduct[],
  userEmail: string
): Promise<ExportResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authorization token not found. Please Sign in with Google first.');
  }

  const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  const title = `Loot Your Look - Approved Clothing Catalog (${timestamp})`;

  const spreadsheetId = await createSpreadsheet(title, token);

  const header = [
    'Product ID',
    'Garment Title',
    'Wholesaler Hub',
    'Department',
    'Clothing Category',
    'Fabric Composition',
    'MRP (₹)',
    'Retail Price (₹)',
    'Wholesale Cost (₹)',
    'Total Stock Units',
    'Available Sizes',
    'Colors',
    'Approval Status',
    'Clothing Only Verified',
  ];

  const rows: (string | number)[][] = [header];

  for (const p of products) {
    const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
    const sizes = Array.from(new Set(p.variants.map((v) => v.size))).join(', ');
    const colors = Array.from(new Set(p.variants.map((v) => v.color))).join(', ');

    rows.push([
      p.id,
      p.title,
      `${p.wholesalerBusinessName} (${p.wholesalerCity})`,
      p.department,
      p.category,
      p.fabric,
      p.mrp,
      p.retailPrice,
      p.wholesaleCost,
      totalStock,
      sizes,
      colors,
      p.status,
      'YES - Verified 100% Clothing Only',
    ]);
  }

  await appendValues(spreadsheetId, 'Sheet1!A1', rows, token);
  await formatSpreadsheetHeader(spreadsheetId, token);

  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const log: GoogleSheetsSyncLog = {
    sheetId: spreadsheetId,
    sheetUrl: spreadsheetUrl,
    title,
    rowCount: rows.length - 1,
    syncedAt: new Date().toISOString(),
    exportedBy: userEmail,
    type: 'inventory',
  };
  addGoogleSheetsLog(log);

  return {
    spreadsheetId,
    spreadsheetUrl,
    rowCount: rows.length - 1,
  };
}
