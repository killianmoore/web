import fs from "node:fs";
import path from "node:path";
import type { DirectoryMember, DirectoryVendor } from "@/lib/pd-directory";
import { sampleMembers, sampleVendors } from "@/lib/pd-directory";

const membersCsvPath = path.join(process.cwd(), "content/pd/members-2024.csv");
const vendorsCsvPath = path.join(process.cwd(), "content/pd/vendors-2024.csv");

function parseCsv(content: string): string[][] {
  // Multiline-safe CSV parser: tracks quotes across line breaks.
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let inQuotes = false;

  const text = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (ch === "\n" && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

function toTitleCaseSection(lastName: string): string {
  const firstLetter = (lastName || "A").trim().charAt(0).toUpperCase() || "A";
  return `Members ${firstLetter}`;
}

function normalizeWebsite(website: string): string | undefined {
  const value = website.trim();
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

function alphaKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function dedupeVendorsWithinCategory(vendors: DirectoryVendor[]): DirectoryVendor[] {
  const seen = new Set<string>();
  const unique: DirectoryVendor[] = [];

  for (const vendor of vendors) {
    // Keep cross-category repeats, but drop duplicate rows in the same category.
    const key = [
      alphaKey(vendor.category),
      alphaKey(vendor.businessName),
      alphaKey(vendor.phone),
      alphaKey(vendor.email),
    ].join("|");

    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(vendor);
  }

  return unique;
}

function loadMembersFromCsv(): DirectoryMember[] {
  if (!fs.existsSync(membersCsvPath)) return sampleMembers;

  const content = fs.readFileSync(membersCsvPath, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) return sampleMembers;

  const dataRows = rows.slice(1);
  const members: DirectoryMember[] = dataRows
    .map((row, index) => {
      const lastName = row[1] ?? "";
      const firstName = row[2] ?? "";
      const workAddress = row[3] ?? "";
      const apt = row[4] ?? "";
      const phone = row[5] ?? "";
      const email = row[6] ?? "";
      const city = row[7] ?? "";
      const state = row[8] ?? "";
      const zip = row[9] ?? "";

      const fullName = [lastName, firstName].filter(Boolean).join(", ").trim();
      const addressLine1 = [workAddress, apt ? `Apt. ${apt}` : ""].filter(Boolean).join(" ");
      const addressLine2 = [city, state, zip].filter(Boolean).join(", ").replace(", ,", ",");

      return {
        id: `m-csv-${index + 1}`,
        section: toTitleCaseSection(lastName),
        fullName,
        addressLine1,
        addressLine2,
        phone,
        email,
      } satisfies DirectoryMember;
    })
    .filter((item) => item.fullName && (item.phone || item.email || item.addressLine1));

  return members.length > 0 ? members : sampleMembers;
}

function loadVendorsFromCsv(): DirectoryVendor[] {
  if (!fs.existsSync(vendorsCsvPath)) return sampleVendors;

  const content = fs.readFileSync(vendorsCsvPath, "utf8");
  const rows = parseCsv(content);
  if (rows.length < 2) return sampleVendors;

  const dataRows = rows.slice(1);
  let currentCategory = "";

  const vendors: DirectoryVendor[] = dataRows
    .map((row, index) => {
      const category1 = row[0] ?? "";
      const companyName = row[1] ?? "";
      const phone = row[6] ?? "";
      const email = row[7] ?? "";
      const website = row[8] ?? "";
      const firstName = row[9] ?? "";
      const lastName = row[10] ?? "";
      const category4 = row[14] ?? "";

      const explicitCategory = category1 || category4;
      if (explicitCategory) currentCategory = explicitCategory;

      const contactName = [firstName, lastName].filter(Boolean).join(" ").trim();

      return {
        id: `v-csv-${index + 1}`,
        category: currentCategory || "Uncategorized",
        businessName: companyName.trim(),
        contactName: contactName || "Office",
        phone: phone.trim(),
        email: email.trim(),
        website: normalizeWebsite(website),
        tier: "standard",
      } satisfies DirectoryVendor;
    })
    .filter((item) => item.businessName && (item.phone || item.email));

  if (vendors.length === 0) return sampleVendors;
  const deduped = dedupeVendorsWithinCategory(vendors);

  return deduped.sort((a, b) => {
    const categoryCompare = alphaKey(a.category).localeCompare(alphaKey(b.category));
    if (categoryCompare !== 0) return categoryCompare;

    return alphaKey(a.businessName).localeCompare(alphaKey(b.businessName));
  });
}

export type DirectoryDataIssue = {
  entity: "member" | "vendor";
  id: string;
  name: string;
  field: "phone" | "email" | "category";
  message: string;
};

export type DirectoryDataReport = {
  members_total: number;
  members_missing_phone: number;
  members_missing_email: number;
  vendors_total: number;
  vendors_missing_phone: number;
  vendors_missing_email: number;
  vendors_missing_category: number;
  issues_total: number;
  issues: DirectoryDataIssue[];
};

function getCsvLastUpdatedAt(): string | null {
  const timestamps: number[] = [];

  if (fs.existsSync(membersCsvPath)) {
    timestamps.push(fs.statSync(membersCsvPath).mtimeMs);
  }

  if (fs.existsSync(vendorsCsvPath)) {
    timestamps.push(fs.statSync(vendorsCsvPath).mtimeMs);
  }

  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function buildReport(members: DirectoryMember[], vendors: DirectoryVendor[]): DirectoryDataReport {
  const issues: DirectoryDataIssue[] = [];

  for (const member of members) {
    if (!member.phone) {
      issues.push({
        entity: "member",
        id: member.id,
        name: member.fullName,
        field: "phone",
        message: "Member is missing phone number",
      });
    }
    if (!member.email) {
      issues.push({
        entity: "member",
        id: member.id,
        name: member.fullName,
        field: "email",
        message: "Member is missing email address",
      });
    }
  }

  for (const vendor of vendors) {
    if (!vendor.category || vendor.category === "Uncategorized") {
      issues.push({
        entity: "vendor",
        id: vendor.id,
        name: vendor.businessName,
        field: "category",
        message: "Vendor is missing category",
      });
    }
    if (!vendor.phone) {
      issues.push({
        entity: "vendor",
        id: vendor.id,
        name: vendor.businessName,
        field: "phone",
        message: "Vendor is missing phone number",
      });
    }
    if (!vendor.email) {
      issues.push({
        entity: "vendor",
        id: vendor.id,
        name: vendor.businessName,
        field: "email",
        message: "Vendor is missing email address",
      });
    }
  }

  return {
    members_total: members.length,
    members_missing_phone: members.filter((m) => !m.phone).length,
    members_missing_email: members.filter((m) => !m.email).length,
    vendors_total: vendors.length,
    vendors_missing_phone: vendors.filter((v) => !v.phone).length,
    vendors_missing_email: vendors.filter((v) => !v.email).length,
    vendors_missing_category: vendors.filter((v) => !v.category || v.category === "Uncategorized")
      .length,
    issues_total: issues.length,
    issues,
  };
}

export function loadDirectoryData(): {
  members: DirectoryMember[];
  vendors: DirectoryVendor[];
  report: DirectoryDataReport;
  lastUpdatedAt: string | null;
} {
  const members = loadMembersFromCsv();
  const vendors = loadVendorsFromCsv();
  return {
    members,
    vendors,
    report: buildReport(members, vendors),
    lastUpdatedAt: getCsvLastUpdatedAt(),
  };
}
