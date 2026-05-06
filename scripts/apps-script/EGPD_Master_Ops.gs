/**
 * EGPD Master Ops Apps Script
 *
 * Purpose:
 * - Ingest application and payment webhook payloads into raw tabs.
 * - Rebuild intake_master with latest payment state per application.
 * - Refresh active-year operational tabs.
 * - Provide committee snapshot endpoint.
 * - Sync committee call-list edits back into intake_master.
 *
 * Note: Google Apps Script Web App does not reliably expose HTTP headers.
 * Secrets are validated from `payload.secret` or query parameter `?secret=`.
 */

const CFG = {
  SHEETS: {
    SETTINGS: 'settings',
    CATEGORIES_REF: 'categories_ref',
    APPS_RAW: 'applications_intake_raw',
    PAYMENTS_RAW: 'payments_raw',
    INTAKE_MASTER: 'intake_master',
    CALL_LIST: 'call_list_live',
    ADS_RECEIVED: 'ads_received_live',
    PAID_ADS: 'paid_ads_live',
    UNPAID_ADS: 'unpaid_ads_live',
    PAYMENT_RECON: 'payment_recon',
    PRINTER_EXPORT: 'printer_export_live',
    PRINTER_VALIDATION: 'printer_export_validation',
    AUDIT: 'audit_log'
  },
  SECRETS: {
    WEBHOOK: 'WEBHOOK_SECRET',
    SNAPSHOT: 'SNAPSHOT_SECRET'
  }
};

const APPLICATION_CANONICAL_COLUMNS = [
  'submitted_at', 'application_id', 'program_year', 'company_name', 'street',
  'address_line_2', 'city', 'state', 'zip_code', 'phone', 'email', 'website',
  'first_name', 'last_name', 'category_1', 'category_2', 'category_3', 'category_4',
  'printed_or_digital', 'guild_member', 'diff_contact', 'payment_status',
  'application_status', 'payment_event_id', 'paid_at', 'payer_email', 'payer_name',
  'amount_total', 'currency', 'source_tab', 'source_status', 'call_status',
  'call_owner', 'call_notes', 'contacted_by', 'contacted_at', 'marked_paid_by',
  'marked_paid_at'
];

const INTAKE_MASTER_EXTRA_COLUMNS = [
  'last_payment_received_at', 'recon_status', 'validation_errors', 'row_last_synced_at'
];

const CALL_LIST_HEADERS = [
  'application_id', 'program_year', 'company_name', 'phone', 'email',
  'payment_status', 'application_status', 'call_status', 'call_owner',
  'call_notes', 'contacted_by', 'contacted_at', 'row_last_synced_at'
];

function doPost(e) {
  try {
    const body = parsePostBody_(e);
    const secret = body.secret || ((e && e.parameter && e.parameter.secret) ? e.parameter.secret : '');
    assertSecret_(secret, CFG.SECRETS.WEBHOOK);

    const eventType = String(body.event_type || '').trim();
    const data = body.data || {};

    if (!eventType) {
      return jsonResponse_({ ok: false, error: 'missing_event_type' });
    }

    if (eventType === 'application.submitted') {
      appendApplicationRaw_(data);
      appendAuditLog_('system:webhook', 'application.submitted', 'application', String(data.application_id || ''), data.program_year, 'ok', 'application appended', data);
    } else if (eventType === 'payment.updated' || eventType === 'payment.succeeded') {
      appendPaymentRaw_(data);
      appendAuditLog_('system:webhook', eventType, 'payment', String(data.payment_event_id || ''), data.program_year, 'ok', 'payment appended', data);
    } else if (eventType === 'ops.sync') {
      appendAuditLog_('system:webhook', 'ops.sync', 'ops', '', getActiveYear_(), 'ok', 'manual sync requested', data);
    } else {
      appendAuditLog_('system:webhook', eventType, 'unknown', '', data.program_year, 'ignored', 'unknown event type', data);
      return jsonResponse_({ ok: false, error: 'unknown_event_type', event_type: eventType });
    }

    runFullSync_();
    return jsonResponse_({ ok: true, event_type: eventType, synced: true });
  } catch (err) {
    appendAuditLog_('system:webhook', 'error', 'ops', '', getActiveYearSafe_(), 'error', String(err), {});
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  try {
    const mode = (e && e.parameter && e.parameter.mode) ? String(e.parameter.mode) : 'committee_snapshot';
    if (mode !== 'committee_snapshot') {
      return jsonResponse_({ ok: false, error: 'unsupported_mode' });
    }

    const secret = (e && e.parameter && e.parameter.secret) ? String(e.parameter.secret) : '';
    assertSecret_(secret, CFG.SECRETS.SNAPSHOT);

    const activeYear = getActiveYear_();
    const rows = getSheetObjects_(CFG.SHEETS.CALL_LIST).filter((r) => String(r.program_year || '') === String(activeYear));

    return jsonResponse_({
      ok: true,
      generated_at: new Date().toISOString(),
      active_year: activeYear,
      count: rows.length,
      rows: rows
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

/**
 * Simple trigger. Committee edits in call_list_live are synced back into intake_master.
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== CFG.SHEETS.CALL_LIST) return;
  if (e.range.getRow() < 2) return;

  const editable = new Set(['call_status', 'call_owner', 'call_notes', 'contacted_by', 'contacted_at']);
  const callHeaders = getHeaders_(sheet);
  const editedHeader = callHeaders[e.range.getColumn() - 1];
  if (!editable.has(editedHeader)) return;

  const rowValues = sheet.getRange(e.range.getRow(), 1, 1, callHeaders.length).getValues()[0];
  const rowObj = rowToObject_(callHeaders, rowValues);

  const appId = String(rowObj.application_id || '').trim();
  const year = String(rowObj.program_year || '').trim();
  if (!appId || !year) return;

  const intakeSheet = getSheet_(CFG.SHEETS.INTAKE_MASTER);
  const intakeHeaders = getHeaders_(intakeSheet);
  const intakeData = intakeSheet.getDataRange().getValues();

  const idxAppId = intakeHeaders.indexOf('application_id');
  const idxYear = intakeHeaders.indexOf('program_year');
  if (idxAppId === -1 || idxYear === -1) return;

  for (let r = 1; r < intakeData.length; r++) {
    if (String(intakeData[r][idxAppId]).trim() === appId && String(intakeData[r][idxYear]).trim() === year) {
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'call_status', rowObj.call_status || '');
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'call_owner', rowObj.call_owner || '');
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'call_notes', rowObj.call_notes || '');
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'contacted_by', rowObj.contacted_by || '');
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'contacted_at', rowObj.contacted_at || '');
      setCellByHeader_(intakeSheet, intakeHeaders, r + 1, 'row_last_synced_at', new Date().toISOString());

      appendAuditLog_('committee:onEdit', 'call_list_update', 'application', appId, year, 'ok', 'call fields synced to intake_master', rowObj);
      break;
    }
  }
}

function runFullSync() {
  runFullSync_();
}

function runFullSync_() {
  rebuildIntakeMaster_();
  refreshOperationalTabs_();
}

function appendApplicationRaw_(data) {
  const sheet = getSheet_(CFG.SHEETS.APPS_RAW);
  const headers = getHeaders_(sheet);

  const record = {};
  headers.forEach((h) => {
    if (Object.prototype.hasOwnProperty.call(data, h)) {
      record[h] = data[h];
    }
  });

  if (!record.submitted_at) record.submitted_at = new Date().toISOString();
  if (!record.program_year) record.program_year = getActiveYear_();
  if (!record.application_status) record.application_status = 'submitted';
  if (!record.payment_status) record.payment_status = 'unpaid';

  appendObjectRow_(sheet, headers, record);
}

function appendPaymentRaw_(data) {
  const sheet = getSheet_(CFG.SHEETS.PAYMENTS_RAW);
  const headers = getHeaders_(sheet);

  const record = {};
  headers.forEach((h) => {
    if (Object.prototype.hasOwnProperty.call(data, h)) {
      record[h] = data[h];
    }
  });

  if (!record.received_at) record.received_at = new Date().toISOString();
  if (!record.program_year) record.program_year = getActiveYear_();
  if (!record.raw_payload_json) record.raw_payload_json = JSON.stringify(data || {});

  appendObjectRow_(sheet, headers, record);
}

function rebuildIntakeMaster_() {
  const masterHeaders = APPLICATION_CANONICAL_COLUMNS.concat(INTAKE_MASTER_EXTRA_COLUMNS);
  const masterSheet = getSheet_(CFG.SHEETS.INTAKE_MASTER);
  writeHeaders_(masterSheet, masterHeaders);

  const appRows = getSheetObjects_(CFG.SHEETS.APPS_RAW)
    .filter((r) => String(r.application_id || '').trim() !== '');

  const latestPayments = buildLatestPaymentMap_();

  const out = appRows.map((app) => {
    const key = paymentKey_(app.application_id, app.program_year || getActiveYear_());
    const payment = latestPayments[key] || null;

    const row = {};
    APPLICATION_CANONICAL_COLUMNS.forEach((c) => {
      row[c] = app[c] || '';
    });

    if (payment) {
      row.payment_event_id = payment.payment_event_id || row.payment_event_id || '';
      row.payment_status = payment.payment_status || row.payment_status || '';
      row.paid_at = payment.paid_at || row.paid_at || '';
      row.payer_email = payment.payer_email || row.payer_email || '';
      row.payer_name = payment.payer_name || row.payer_name || '';
      row.amount_total = payment.amount_total || row.amount_total || '';
      row.currency = payment.currency || row.currency || '';
    }

    const paymentStatus = String(row.payment_status || '').toLowerCase();
    const reconStatus = paymentStatus === 'paid' ? 'reconciled' : 'pending_payment';

    row.last_payment_received_at = payment ? (payment.received_at || '') : '';
    row.recon_status = reconStatus;
    row.validation_errors = '';
    row.row_last_synced_at = new Date().toISOString();

    return masterHeaders.map((h) => row[h] || '');
  });

  writeDataBody_(masterSheet, out);
}

function refreshOperationalTabs_() {
  const activeYear = String(getActiveYear_());
  const masterRows = getSheetObjects_(CFG.SHEETS.INTAKE_MASTER);
  const activeRows = masterRows.filter((r) => String(r.program_year || '') === activeYear);

  writeObjectRows_(CFG.SHEETS.ADS_RECEIVED, APPLICATION_CANONICAL_COLUMNS.concat(INTAKE_MASTER_EXTRA_COLUMNS), activeRows);

  const paidRows = activeRows.filter((r) => String(r.payment_status || '').toLowerCase() === 'paid');
  const unpaidRows = activeRows.filter((r) => String(r.payment_status || '').toLowerCase() !== 'paid');

  writeObjectRows_(CFG.SHEETS.PAID_ADS, APPLICATION_CANONICAL_COLUMNS.concat(INTAKE_MASTER_EXTRA_COLUMNS), paidRows);
  writeObjectRows_(CFG.SHEETS.UNPAID_ADS, APPLICATION_CANONICAL_COLUMNS.concat(INTAKE_MASTER_EXTRA_COLUMNS), unpaidRows);

  refreshCallListLive_(activeRows);
  refreshPaymentRecon_(activeRows);
  const validationResult = refreshPrinterValidation_(activeRows);
  refreshPrinterExport_(paidRows, validationResult.blockedByAppYear);
}

function refreshCallListLive_(activeRows) {
  const sheet = getSheet_(CFG.SHEETS.CALL_LIST);
  writeHeaders_(sheet, CALL_LIST_HEADERS);

  const existing = getSheetObjects_(CFG.SHEETS.CALL_LIST);
  const persisted = {};
  existing.forEach((r) => {
    const key = paymentKey_(r.application_id, r.program_year);
    persisted[key] = {
      call_status: r.call_status || '',
      call_owner: r.call_owner || '',
      call_notes: r.call_notes || '',
      contacted_by: r.contacted_by || '',
      contacted_at: r.contacted_at || ''
    };
  });

  const rows = activeRows.map((r) => {
    const key = paymentKey_(r.application_id, r.program_year);
    const keep = persisted[key] || {};
    const out = {
      application_id: r.application_id || '',
      program_year: r.program_year || '',
      company_name: r.company_name || '',
      phone: r.phone || '',
      email: r.email || '',
      payment_status: r.payment_status || '',
      application_status: r.application_status || '',
      call_status: keep.call_status || r.call_status || '',
      call_owner: keep.call_owner || r.call_owner || '',
      call_notes: keep.call_notes || r.call_notes || '',
      contacted_by: keep.contacted_by || r.contacted_by || '',
      contacted_at: keep.contacted_at || r.contacted_at || '',
      row_last_synced_at: new Date().toISOString()
    };
    return CALL_LIST_HEADERS.map((h) => out[h] || '');
  });

  writeDataBody_(sheet, rows);
}

function refreshPaymentRecon_(activeRows) {
  const headers = [
    'application_id', 'program_year', 'company_name', 'email', 'intake_amount_total',
    'latest_payment_amount_total', 'intake_payment_status', 'latest_payment_status',
    'recon_status', 'recon_notes', 'last_payment_received_at'
  ];

  const latestPayments = buildLatestPaymentMap_();

  const rows = activeRows.map((r) => {
    const key = paymentKey_(r.application_id, r.program_year);
    const p = latestPayments[key] || {};

    const intakeStatus = String(r.payment_status || '').toLowerCase();
    const latestStatus = String(p.payment_status || '').toLowerCase();

    const intakeAmount = numeric_(r.amount_total);
    const latestAmount = numeric_(p.amount_total);

    let reconStatus = 'UNPAID';
    let reconNotes = '';

    if (intakeStatus === 'paid' && latestStatus === 'paid') {
      if (intakeAmount > 0 && latestAmount > 0 && intakeAmount !== latestAmount) {
        reconStatus = 'AMOUNT_MISMATCH';
        reconNotes = 'intake and latest payment amounts differ';
      } else {
        reconStatus = 'OK';
      }
    } else if (intakeStatus === 'paid' && latestStatus !== 'paid') {
      reconStatus = 'PAID_STATE_MISMATCH';
      reconNotes = 'intake marked paid but latest payment is not paid';
    } else if (intakeStatus !== 'paid' && latestStatus === 'paid') {
      reconStatus = 'INTAKE_STALE';
      reconNotes = 'payment is paid but intake not updated';
    }

    return [
      r.application_id || '',
      r.program_year || '',
      r.company_name || '',
      r.email || '',
      r.amount_total || '',
      p.amount_total || '',
      r.payment_status || '',
      p.payment_status || '',
      reconStatus,
      reconNotes,
      p.received_at || ''
    ];
  });

  const sheet = getSheet_(CFG.SHEETS.PAYMENT_RECON);
  writeHeaders_(sheet, headers);
  writeDataBody_(sheet, rows);
}

function refreshPrinterValidation_(activeRows) {
  const headers = [
    'application_id', 'program_year', 'company_name', 'email', 'is_missing_required',
    'is_duplicate_company_email_year', 'is_category_invalid_or_missing', 'is_paid_mismatch',
    'is_blocked', 'validation_notes'
  ];

  const categoryMap = buildCategoryMap_();
  const dupCounts = {};

  activeRows.forEach((r) => {
    const dupKey = duplicateKey_(r.company_name, r.email, r.program_year);
    dupCounts[dupKey] = (dupCounts[dupKey] || 0) + 1;
  });

  const blockedByAppYear = {};

  const rows = activeRows.map((r) => {
    const year = String(r.program_year || '');
    const appId = String(r.application_id || '');

    const missingRequired = [r.company_name, r.street, r.city, r.state, r.zip_code, r.email]
      .some((v) => String(v || '').trim() === '');

    const dup = dupCounts[duplicateKey_(r.company_name, r.email, r.program_year)] > 1;

    const cats = [r.category_1, r.category_2, r.category_3, r.category_4]
      .map((c) => String(c || '').trim())
      .filter((c) => c !== '');

    const allowedCats = categoryMap[year] || new Set();
    const categoryInvalidOrMissing = (cats.length === 0) || cats.some((c) => !allowedCats.has(c));

    const paymentStatus = String(r.payment_status || '').toLowerCase();
    const amountTotal = numeric_(r.amount_total);
    const paidMismatch = paymentStatus === 'paid' && amountTotal <= 0;

    const blocked = missingRequired || dup || categoryInvalidOrMissing || paidMismatch;
    blockedByAppYear[paymentKey_(appId, year)] = blocked;

    const notes = [];
    if (missingRequired) notes.push('missing required fields');
    if (dup) notes.push('duplicate company+email+year');
    if (categoryInvalidOrMissing) notes.push('category missing/invalid');
    if (paidMismatch) notes.push('paid status mismatch');

    return [
      appId,
      year,
      r.company_name || '',
      r.email || '',
      missingRequired,
      dup,
      categoryInvalidOrMissing,
      paidMismatch,
      blocked,
      notes.join('; ')
    ];
  });

  const sheet = getSheet_(CFG.SHEETS.PRINTER_VALIDATION);
  writeHeaders_(sheet, headers);
  writeDataBody_(sheet, rows);

  return { blockedByAppYear: blockedByAppYear };
}

function refreshPrinterExport_(paidRows, blockedByAppYear) {
  const headers = [
    'program_year', 'company_name', 'street', 'address_line_2', 'city', 'state',
    'zip_code', 'phone', 'email', 'website', 'first_name', 'last_name',
    'category_1', 'category_2', 'category_3', 'category_4', 'printed_or_digital',
    'guild_member', 'payment_status', 'application_status'
  ];

  const rows = paidRows
    .filter((r) => !blockedByAppYear[paymentKey_(r.application_id, r.program_year)])
    .map((r) => [
      r.program_year || '',
      r.company_name || '',
      r.street || '',
      r.address_line_2 || '',
      r.city || '',
      r.state || '',
      r.zip_code || '',
      r.phone || '',
      r.email || '',
      r.website || '',
      r.first_name || '',
      r.last_name || '',
      r.category_1 || '',
      r.category_2 || '',
      r.category_3 || '',
      r.category_4 || '',
      r.printed_or_digital || '',
      r.guild_member || '',
      r.payment_status || '',
      r.application_status || ''
    ]);

  const sheet = getSheet_(CFG.SHEETS.PRINTER_EXPORT);
  writeHeaders_(sheet, headers);
  writeDataBody_(sheet, rows);
}

function buildLatestPaymentMap_() {
  const rows = getSheetObjects_(CFG.SHEETS.PAYMENTS_RAW);
  const map = {};

  rows.forEach((r) => {
    const key = paymentKey_(r.application_id, r.program_year || getActiveYear_());
    if (!key || key === '|') return;

    const currentTs = Date.parse(String(r.received_at || r.paid_at || '')) || 0;
    const existing = map[key];
    const existingTs = existing ? (Date.parse(String(existing.received_at || existing.paid_at || '')) || 0) : -1;

    if (!existing || currentTs >= existingTs) {
      map[key] = r;
    }
  });

  return map;
}

function buildCategoryMap_() {
  const rows = getSheetObjects_(CFG.SHEETS.CATEGORIES_REF);
  const map = {};

  rows.forEach((r) => {
    const year = String(r.program_year || '').trim();
    const cat = String(r.category_name || '').trim();
    const active = String(r.is_active || 'true').toLowerCase();
    if (!year || !cat || active === 'false' || active === '0' || active === 'no') return;

    if (!map[year]) map[year] = new Set();
    map[year].add(cat);
  });

  return map;
}

function getActiveYear_() {
  const sheet = getSheet_(CFG.SHEETS.SETTINGS);
  const v = sheet.getRange('B1').getValue();
  return String(v || '').trim() || String(new Date().getFullYear());
}

function getActiveYearSafe_() {
  try {
    return getActiveYear_();
  } catch (_err) {
    return String(new Date().getFullYear());
  }
}

function parsePostBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  const text = e.postData.contents;
  return JSON.parse(text);
}

function assertSecret_(provided, propertyKey) {
  const expected = PropertiesService.getScriptProperties().getProperty(propertyKey);
  if (!expected) throw new Error('missing_script_property_' + propertyKey);
  if (String(provided || '') !== String(expected)) throw new Error('invalid_secret');
}

function appendAuditLog_(actor, action, entity, entityId, year, status, message, payload) {
  const sheet = getSheet_(CFG.SHEETS.AUDIT);
  const headers = getHeaders_(sheet);

  const record = {
    logged_at: new Date().toISOString(),
    actor: actor || '',
    action: action || '',
    entity: entity || '',
    entity_id: entityId || '',
    program_year: year || '',
    status: status || '',
    message: message || '',
    payload_json: JSON.stringify(payload || {})
  };

  appendObjectRow_(sheet, headers, record);
}

function getSheet_(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('missing_sheet_' + name);
  return sh;
}

function getHeaders_(sheet) {
  const lastCol = Math.max(1, sheet.getLastColumn());
  const vals = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  return vals.map((v) => String(v || '').trim());
}

function getSheetObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return data
    .map((row) => rowToObject_(headers, row))
    .filter((obj) => Object.values(obj).some((v) => String(v || '').trim() !== ''));
}

function rowToObject_(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i]; });
  return obj;
}

function appendObjectRow_(sheet, headers, obj) {
  const row = headers.map((h) => (Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ''));
  sheet.appendRow(row);
}

function writeObjectRows_(sheetName, headers, objects) {
  const sheet = getSheet_(sheetName);
  writeHeaders_(sheet, headers);
  const rows = objects.map((o) => headers.map((h) => o[h] || ''));
  writeDataBody_(sheet, rows);
}

function writeHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function writeDataBody_(sheet, rows) {
  const maxCols = Math.max(1, sheet.getLastColumn());
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, maxCols).clearContent();
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function setCellByHeader_(sheet, headers, rowNumber, header, value) {
  const idx = headers.indexOf(header);
  if (idx === -1) return;
  sheet.getRange(rowNumber, idx + 1).setValue(value);
}

function paymentKey_(applicationId, year) {
  return String(applicationId || '').trim() + '|' + String(year || '').trim();
}

function duplicateKey_(company, email, year) {
  return String(company || '').trim().toLowerCase() + '|' + String(email || '').trim().toLowerCase() + '|' + String(year || '').trim();
}

function numeric_(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
