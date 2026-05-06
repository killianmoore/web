# Formulas and Rules (Current Canonical)

Assumptions:
- `intake_master` uses columns `A:AL` in canonical order.
- `settings!B1` contains active year (example: `2026`).

## 0) Basic checks
- `settings!B1` has a valid year.
- `intake_master!C:C` (`program_year`) contains that year for current rows.

## 1) ads_received_live
In `ads_received_live!A1`:
```gs
=VSTACK(
  intake_master!A1:AL1,
  FILTER(intake_master!A2:AL, intake_master!C2:C=settings!B1)
)
```

## 2) paid_ads_live
In `paid_ads_live!A1`:
```gs
=VSTACK(
  intake_master!A1:AL1,
  FILTER(
    intake_master!A2:AL,
    intake_master!C2:C=settings!B1,
    intake_master!V2:V="paid"
  )
)
```

## 3) unpaid_ads_live
In `unpaid_ads_live!A1`:
```gs
=VSTACK(
  intake_master!A1:AL1,
  FILTER(
    intake_master!A2:AL,
    intake_master!C2:C=settings!B1,
    intake_master!V2:V<>"paid"
  )
)
```

## 4) payment_recon
Header row in `payment_recon!A1:H1`:
- `application_id | company_name | email | payment_status | paid_at | payment_event_id | status_flag | mismatch_note`

In `payment_recon!A2`:
```gs
=FILTER(
  {intake_master!B2:B,intake_master!D2:D,intake_master!K2:K,intake_master!V2:V,intake_master!Y2:Y,intake_master!X2:X},
  intake_master!C2:C=settings!B1
)
```

In `payment_recon!G2`:
```gs
=ARRAYFORMULA(IF(A2:A="","",IF(D2:D="paid","paid","awaiting_payment")))
```

In `payment_recon!H2`:
```gs
=ARRAYFORMULA(
  IF(
    A2:A="",
    "",
    IF(
      (D2:D="paid")*(E2:E=""),
      "paid_missing_paid_at",
      IF((D2:D<>"paid")*(F2:F<>""),"unpaid_has_payment_event","")
    )
  )
)
```

## 5) printer_export_live
In `printer_export_live!A1`:
```gs
={"company_name","street","city","state","zip_code","phone","email","website","first_name","last_name","category_1","category_2","category_3","category_4","printed_or_digital","guild_member","payment_status","is_unpaid";
  FILTER(
    {intake_master!D2:D,intake_master!E2:E,intake_master!G2:G,intake_master!H2:H,intake_master!I2:I,intake_master!J2:J,intake_master!K2:K,intake_master!L2:L,intake_master!M2:M,intake_master!N2:N,intake_master!O2:O,intake_master!P2:P,intake_master!Q2:Q,intake_master!R2:R,intake_master!S2:S,intake_master!T2:T,intake_master!V2:V,IF(intake_master!V2:V="paid","no","yes")},
    intake_master!C2:C=settings!B1
  )
}
```

## 6) Conditional formatting (unpaid rows = light red)

Apply to `ads_received_live`, `unpaid_ads_live`, `printer_export_live`.

- For tabs with full `A:AL` schema (`ads_received_live`, `unpaid_ads_live`), custom formula:
```gs
=$V2<>"paid"
```

- For `printer_export_live` (where `payment_status` is column `Q`), custom formula:
```gs
=$Q2<>"paid"
```

- Fill color: light red (example `#FCE8E6`).

## 7) Protection model
- Lock entire raw tabs: `applications_intake_raw`, `payments_raw`.
- Lock formula/script-managed tabs except explicit committee input columns.
- In `call_list_live`, only editable:
  - `call_status`
  - `call_owner`
  - `call_notes`
  - `contacted_by`
  - `contacted_at`

## 8) Safe-empty versions (recommended)
Use these if you want headers visible even when there are no matching rows.

### ads_received_live (safe)
In `ads_received_live!A1`:
```gs
=IFERROR(
  VSTACK(
    intake_master!A1:AL1,
    FILTER(intake_master!A2:AL, intake_master!C2:C=settings!B1)
  ),
  intake_master!A1:AL1
)
```

### paid_ads_live (safe)
In `paid_ads_live!A1`:
```gs
=IFERROR(
  VSTACK(
    intake_master!A1:AL1,
    FILTER(
      intake_master!A2:AL,
      intake_master!C2:C=settings!B1,
      intake_master!V2:V="paid"
    )
  ),
  intake_master!A1:AL1
)
```

### unpaid_ads_live (safe)
In `unpaid_ads_live!A1`:
```gs
=IFERROR(
  VSTACK(
    intake_master!A1:AL1,
    FILTER(
      intake_master!A2:AL,
      intake_master!C2:C=settings!B1,
      intake_master!V2:V<>"paid"
    )
  ),
  intake_master!A1:AL1
)
```

### payment_recon source block (safe)
In `payment_recon!A2`:
```gs
=IFERROR(
  FILTER(
    {intake_master!B2:B,intake_master!D2:D,intake_master!K2:K,intake_master!V2:V,intake_master!Y2:Y,intake_master!X2:X},
    intake_master!C2:C=settings!B1
  ),
  ""
)
```

### printer_export_live (safe)
In `printer_export_live!A1`:
```gs
={
  "company_name","street","city","state","zip_code","phone","email","website","first_name","last_name","category_1","category_2","category_3","category_4","printed_or_digital","guild_member","payment_status","is_unpaid";
  IFERROR(
    FILTER(
      {intake_master!D2:D,intake_master!E2:E,intake_master!G2:G,intake_master!H2:H,intake_master!I2:I,intake_master!J2:J,intake_master!K2:K,intake_master!L2:L,intake_master!M2:M,intake_master!N2:N,intake_master!O2:O,intake_master!P2:P,intake_master!Q2:Q,intake_master!R2:R,intake_master!S2:S,intake_master!T2:T,intake_master!V2:V,IF(intake_master!V2:V="paid","no","yes")},
      intake_master!C2:C=settings!B1
    ),
    {}
  )
}
```
