# Webhook Mapping and Environment Variables

## Environment variables (app side)
- `APPLICATION_WEBHOOK_URL`
- `APPLICATION_WEBHOOK_SECRET`
- `COMMITTEE_SNAPSHOT_URL`
- `COMMITTEE_SNAPSHOT_SECRET`

## Endpoint contract (Apps Script Web App)

### 1) Application submit -> append `applications_intake_raw`
`POST APPLICATION_WEBHOOK_URL`

Payload:
```json
{
  "secret": "APPLICATION_WEBHOOK_SECRET",
  "event_type": "application.submitted",
  "data": {
    "submitted_at": "2026-02-15T12:00:00Z",
    "application_id": "app_123",
    "program_year": 2026,
    "company_name": "Example Co",
    "street": "123 Main",
    "address_line_2": "",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "phone": "555-111-2222",
    "email": "owner@example.com",
    "website": "https://example.com",
    "first_name": "Alex",
    "last_name": "Doe",
    "category_1": "Restaurants",
    "category_2": "",
    "category_3": "",
    "category_4": "",
    "printed_or_digital": "printed",
    "guild_member": "yes",
    "diff_contact": "",
    "payment_status": "unpaid",
    "application_status": "submitted",
    "source_tab": "apply",
    "source_status": "new"
  }
}
```

### 2) Stripe/backend payment event -> append `payments_raw` and sync
`POST APPLICATION_WEBHOOK_URL`

Payload:
```json
{
  "secret": "APPLICATION_WEBHOOK_SECRET",
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
    "currency": "usd",
    "stripe_payment_intent_id": "pi_123",
    "stripe_charge_id": "ch_123"
  }
}
```

## Committee snapshot endpoint
`GET COMMITTEE_SNAPSHOT_URL?mode=committee_snapshot&secret=COMMITTEE_SNAPSHOT_SECRET`

Response:
```json
{
  "ok": true,
  "generated_at": "2026-02-15T12:30:00Z",
  "active_year": "2026",
  "count": 12,
  "rows": [
    {
      "application_id": "app_123",
      "program_year": "2026",
      "company_name": "Example Co",
      "phone": "555-111-2222",
      "email": "owner@example.com",
      "payment_status": "paid",
      "application_status": "submitted",
      "call_status": "left_voicemail",
      "call_owner": "JD",
      "call_notes": "Call back Tuesday",
      "contacted_by": "JD",
      "contacted_at": "2026-02-15T12:25:00Z",
      "row_last_synced_at": "2026-02-15T12:26:00Z"
    }
  ]
}
```

## Event -> sheet mapping summary
- `application.submitted` -> append `applications_intake_raw`
- `payment.updated` / `payment.succeeded` -> append `payments_raw`
- every accepted webhook -> rebuild `intake_master`, then refresh:
  - `call_list_live`
  - `ads_received_live`
  - `paid_ads_live`
  - `unpaid_ads_live`
  - `payment_recon`
  - `printer_export_validation`
  - `printer_export_live`
