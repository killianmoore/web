/**
 * EGPD sheet webhook receiver for EGPD_Master_Ops.
 *
 * Deploy as Apps Script Web App and POST JSON payloads.
 */

var SHEETS = {
  intakeRaw: 'Intake_Raw',
  committeeActionsRaw: 'Committee_Actions_Raw'
};

var HEADERS = {
  Intake_Raw: [
    'ingested_at_utc',
    'event_type',
    'submission_id',
    'application_id',
    'submitted_at',
    'year',
    'applicant_name',
    'applicant_email',
    'project_name',
    'amount_requested',
    'stage',
    'payload_json'
  ],
  Committee_Actions_Raw: [
    'action_ts',
    'application_id',
    'action_type',
    'committee_status',
    'committee_member',
    'score',
    'notes',
    'year',
    'payload_json'
  ]
};

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    ensureSheets_();

    if (!payload.type) {
      return jsonResponse_(400, { ok: false, error: 'Missing `type` in payload' });
    }

    if (payload.type === 'application.submitted') {
      appendApplicationSubmitted_(payload);
      return jsonResponse_(200, { ok: true, event: payload.type });
    }

    if (payload.type === 'committee.action') {
      appendCommitteeAction_(payload);
      return jsonResponse_(200, { ok: true, event: payload.type });
    }

    return jsonResponse_(400, {
      ok: false,
      error: 'Unsupported event type',
      receivedType: payload.type
    });
  } catch (err) {
    return jsonResponse_(500, {
      ok: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('No POST body provided');
  }
  return JSON.parse(e.postData.contents);
}

function appendApplicationSubmitted_(payload) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.intakeRaw);
  var ingestedAt = new Date().toISOString();
  var year = deriveYear_(payload.submittedAt, payload.year);

  var row = [
    ingestedAt,
    payload.type || '',
    payload.submissionId || '',
    payload.applicationId || '',
    payload.submittedAt || '',
    year,
    getPath_(payload, 'applicant.name'),
    getPath_(payload, 'applicant.email'),
    getPath_(payload, 'project.name'),
    numberOrBlank_(getPath_(payload, 'budget.amountRequested')),
    payload.stage || '',
    JSON.stringify(payload)
  ];

  sheet.appendRow(row);
}

function appendCommitteeAction_(payload) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(SHEETS.committeeActionsRaw);
  var actionTs = payload.actionTs || new Date().toISOString();
  var year = deriveYear_(actionTs, payload.year);

  var row = [
    actionTs,
    payload.applicationId || '',
    payload.actionType || '',
    payload.committeeStatus || '',
    payload.committeeMember || '',
    numberOrBlank_(payload.score),
    payload.notes || '',
    year,
    JSON.stringify(payload)
  ];

  sheet.appendRow(row);
}

function ensureSheets_() {
  var ss = SpreadsheetApp.getActive();

  Object.keys(HEADERS).forEach(function (sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var expected = HEADERS[sheetName];
    var current = sheet.getRange(1, 1, 1, expected.length).getValues()[0];

    var matches = expected.every(function (h, i) {
      return current[i] === h;
    });

    if (!matches) {
      sheet.getRange(1, 1, 1, expected.length).setValues([expected]);
    }
  });
}

function deriveYear_(isoDate, fallbackYear) {
  if (fallbackYear) {
    return Number(fallbackYear) || '';
  }
  if (!isoDate) {
    return '';
  }

  var d = new Date(isoDate);
  if (isNaN(d.getTime())) {
    return '';
  }
  return d.getUTCFullYear();
}

function numberOrBlank_(v) {
  if (v === null || v === undefined || v === '') {
    return '';
  }
  var n = Number(v);
  return isNaN(n) ? '' : n;
}

function getPath_(obj, path) {
  var parts = path.split('.');
  var out = obj;

  for (var i = 0; i < parts.length; i++) {
    if (out === null || out === undefined) {
      return '';
    }
    out = out[parts[i]];
  }

  return out === null || out === undefined ? '' : out;
}

function jsonResponse_(statusCode, body) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: statusCode, data: body }))
    .setMimeType(ContentService.MimeType.JSON);
}
