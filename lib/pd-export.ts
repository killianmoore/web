import { loadDirectoryData } from "@/lib/pd-csv";
import { FRONT_PAGES } from "@/lib/pd-front-pages";

function csvEscape(value: string): string {
  const normalized = value ?? "";
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function buildMembersExportCsv(): string {
  const { members } = loadDirectoryData();
  const header = [
    "id",
    "section",
    "full_name",
    "address_line_1",
    "address_line_2",
    "phone",
    "email",
  ];
  const rows = members.map((member) =>
    [
      member.id,
      member.section,
      member.fullName,
      member.addressLine1,
      member.addressLine2,
      member.phone,
      member.email,
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function buildVendorsExportCsv(): string {
  const { vendors } = loadDirectoryData();
  const header = [
    "id",
    "category",
    "business_name",
    "contact_name",
    "phone",
    "email",
    "website",
    "tier",
    "blurb",
  ];
  const rows = vendors.map((vendor) =>
    [
      vendor.id,
      vendor.category,
      vendor.businessName,
      vendor.contactName,
      vendor.phone,
      vendor.email,
      vendor.website ?? "",
      vendor.tier,
      vendor.blurb ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

export function buildFrontPagesExportJson(): string {
  return JSON.stringify(FRONT_PAGES, null, 2);
}

export function buildDataQualityReportJson(): string {
  const { report, lastUpdatedAt } = loadDirectoryData();
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      sourceLastUpdatedAt: lastUpdatedAt,
      summary: {
        members_total: report.members_total,
        members_missing_phone: report.members_missing_phone,
        members_missing_email: report.members_missing_email,
        vendors_total: report.vendors_total,
        vendors_missing_phone: report.vendors_missing_phone,
        vendors_missing_email: report.vendors_missing_email,
        vendors_missing_category: report.vendors_missing_category,
        issues_total: report.issues_total,
      },
      issues: report.issues,
    },
    null,
    2,
  );
}
