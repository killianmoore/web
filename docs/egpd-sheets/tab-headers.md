# Exact Tab Names and Header Templates

Create tabs exactly as listed below:
1. `settings`
2. `categories_ref`
3. `applications_intake_raw`
4. `payments_raw`
5. `intake_master`
6. `call_list_live`
7. `ads_received_live`
8. `paid_ads_live`
9. `unpaid_ads_live`
10. `payment_recon`
11. `printer_export_live`
12. `printer_export_validation`
13. `audit_log`

## settings
Row 1:
- `setting_key`
- `setting_value`

Required values:
- `A1=active_year`
- `B1=2026` (or your current year)

## categories_ref
Row 1:
- `program_year`
- `category_name`
- `category_group`
- `is_active`
- `sort_order`

## applications_intake_raw
Row 1 (canonical):
- `submitted_at`
- `application_id`
- `program_year`
- `company_name`
- `street`
- `address_line_2`
- `city`
- `state`
- `zip_code`
- `phone`
- `email`
- `website`
- `first_name`
- `last_name`
- `category_1`
- `category_2`
- `category_3`
- `category_4`
- `printed_or_digital`
- `guild_member`
- `diff_contact`
- `payment_status`
- `application_status`
- `payment_event_id`
- `paid_at`
- `payer_email`
- `payer_name`
- `amount_total`
- `currency`
- `source_tab`
- `source_status`
- `call_status`
- `call_owner`
- `call_notes`
- `contacted_by`
- `contacted_at`
- `marked_paid_by`
- `marked_paid_at`

## payments_raw
Row 1:
- `received_at`
- `payment_event_id`
- `application_id`
- `program_year`
- `payment_status`
- `paid_at`
- `payer_email`
- `payer_name`
- `amount_total`
- `currency`
- `stripe_payment_intent_id`
- `stripe_charge_id`
- `raw_payload_json`

## intake_master
Use same canonical columns as `applications_intake_raw`, plus:
- `last_payment_received_at`
- `recon_status`
- `validation_errors`
- `row_last_synced_at`

## call_list_live
Committee-editable tab. Row 1:
- `application_id`
- `program_year`
- `company_name`
- `phone`
- `email`
- `payment_status`
- `application_status`
- `call_status`
- `call_owner`
- `call_notes`
- `contacted_by`
- `contacted_at`
- `row_last_synced_at`

## ads_received_live / paid_ads_live / unpaid_ads_live
Header row mirrors `intake_master` exactly.

## payment_recon
Row 1:
- `application_id`
- `program_year`
- `company_name`
- `email`
- `intake_amount_total`
- `latest_payment_amount_total`
- `intake_payment_status`
- `latest_payment_status`
- `recon_status`
- `recon_notes`
- `last_payment_received_at`

## printer_export_live
Row 1:
- `program_year`
- `company_name`
- `street`
- `address_line_2`
- `city`
- `state`
- `zip_code`
- `phone`
- `email`
- `website`
- `first_name`
- `last_name`
- `category_1`
- `category_2`
- `category_3`
- `category_4`
- `printed_or_digital`
- `guild_member`
- `payment_status`
- `application_status`

## printer_export_validation
Row 1:
- `application_id`
- `program_year`
- `company_name`
- `email`
- `is_missing_required`
- `is_duplicate_company_email_year`
- `is_category_invalid_or_missing`
- `is_paid_mismatch`
- `is_blocked`
- `validation_notes`

## audit_log
Row 1:
- `logged_at`
- `actor`
- `action`
- `entity`
- `entity_id`
- `program_year`
- `status`
- `message`
- `payload_json`
