# EGPD Master Ops - One Workbook Setup

This package defines a durable, multi-year Google Sheets operating model for `EGPD_Master_Ops`.

Files:
- `docs/egpd-sheets/tab-headers.md`: exact tab names and header row templates.
- `docs/egpd-sheets/formulas.md`: formulas and conditional formatting rules.
- `scripts/apps-script/EGPD_Master_Ops.gs`: Apps Script webhook + sync/validation pipeline.

## Build Order (One Pass)
1. Create workbook `EGPD_Master_Ops`.
2. Create tabs in exact order from `tab-headers.md`.
3. Paste header rows into row 1 for each tab.
4. In `settings!B1`, set active year (example: `2026`).
5. Apply formulas from `formulas.md`.
6. Install `scripts/apps-script/EGPD_Master_Ops.gs` in Extensions -> Apps Script.
7. In Apps Script Project Settings -> Script properties, set:
   - `WEBHOOK_SECRET`
   - `SNAPSHOT_SECRET`
8. Deploy Apps Script as Web App and connect endpoints from your backend.

## Expected inbound payload shape
All webhook calls use JSON and include header `X-EGPD-SECRET`.

`application.submitted`:
```json
{
  "event_type": "application.submitted",
  "data": {
    "submitted_at": "2026-02-15T12:00:00Z",
    "application_id": "app_123",
    "program_year": 2026,
    "company_name": "Example Co",
    "email": "owner@example.com"
  }
}
```

`payment.updated` (or `payment.succeeded`):
```json
{
  "event_type": "payment.updated",
  "data": {
    "received_at": "2026-02-15T12:03:00Z",
    "payment_event_id": "evt_123",
    "application_id": "app_123",
    "program_year": 2026,
    "payment_status": "paid",
    "paid_at": "2026-02-15T12:02:00Z",
    "payer_email": "pay@example.com",
    "payer_name": "Example Pay",
    "amount_total": 350,
    "currency": "usd"
  }
}
```
