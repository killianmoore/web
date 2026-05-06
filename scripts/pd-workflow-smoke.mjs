#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.PD_TEST_BASE_URL || "http://127.0.0.1:3000";
const PD_KEY = process.env.PD_LAB_KEY || "";
const APP_URL = process.env.PD_APPLICATION_URL || "";
const APP_EXPECT_TEXT = process.env.PD_APPLICATION_EXPECT_TEXT || "";
const COMMITTEE_URL = process.env.PD_COMMITTEE_URL || "";
const COMMITTEE_EXPECT_TEXT = process.env.PD_COMMITTEE_EXPECT_TEXT || "";
const REQUIRE_EXTERNAL = process.env.PD_REQUIRE_EXTERNAL === "1";
const REQUEST_TIMEOUT_MS = Number(process.env.PD_TEST_TIMEOUT_MS || 15000);

const requiredFiles = [
  "members-export",
  "vendors-export",
  "front-pages-export",
  "data-quality-report",
];

function buildUrl(input) {
  return new URL(input, BASE_URL).toString();
}

function parseCsv(content) {
  const rows = [];
  let cell = "";
  let row = [];
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

async function fetchText(url, expectedStatus = 200) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, got ${response.status}`);
  }
  return { response, body };
}

async function assertBaseUrlReachable() {
  try {
    await fetchText(buildUrl("/"), 200);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Base URL is unreachable (${BASE_URL}). Start the app or set PD_TEST_BASE_URL. Original error: ${details}`,
    );
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function includesCaseInsensitive(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

async function runStep(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    console.log(`PASS ${name} (${ms}ms)`);
    return true;
  } catch (error) {
    const ms = Date.now() - start;
    console.error(`FAIL ${name} (${ms}ms)`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function checkExternalPage(label, url, expectText) {
  if (!url) {
    if (REQUIRE_EXTERNAL) {
      throw new Error(`${label} URL is required but missing`);
    }
    console.log(`SKIP ${label} (URL not configured)`);
    return;
  }

  const { body } = await fetchText(url, 200);
  if (expectText) {
    assert(
      includesCaseInsensitive(body, expectText),
      `${label} did not include expected text: ${expectText}`,
    );
  }
}

async function main() {
  if (!PD_KEY) {
    console.error("PD_LAB_KEY is required.");
    console.error("Example: PD_LAB_KEY=... npm run test:pd:workflow");
    process.exit(1);
  }

  await assertBaseUrlReachable();

  const steps = [];

  steps.push(
    await runStep("PD lab rejects missing key", async () => {
      const { response } = await fetchText(buildUrl("/pd-lab"), 404);
      assert(response.status === 404, "Missing key should not access /pd-lab");
    }),
  );

  steps.push(
    await runStep("PD front cover renders", async () => {
      const { body } = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=front`), 200);
      assert(body.includes("ROLL OF HONOR"), "Missing cover title");
      assert(body.includes("COVER") && body.includes("MEMBERS") && body.includes("VENDORS"), "Missing mode tabs");
    }),
  );

  steps.push(
    await runStep("PD members and vendors render", async () => {
      const members = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=members`), 200);
      assert(members.body.includes("MEMBERS DIRECTORY"), "Members heading missing");
      assert(members.body.includes("Show only favorites"), "Members favorites toggle missing");

      const vendors = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=vendors`), 200);
      assert(vendors.body.includes("VENDOR DIRECTORY"), "Vendors heading missing");
      assert(vendors.body.includes("All categories"), "Vendor category filter missing");
    }),
  );

  steps.push(
    await runStep("PD export endpoint enforces auth", async () => {
      const { body } = await fetchText(buildUrl("/api/pd/export"), 401);
      const parsed = JSON.parse(body);
      assert(parsed.error === "Unauthorized", "Unauthorized export response mismatch");
    }),
  );

  let membersRows = [];
  let vendorsRows = [];

  steps.push(
    await runStep("PD export payload is complete and parseable", async () => {
      const url = buildUrl(`/api/pd/export?k=${encodeURIComponent(PD_KEY)}`);
      const { body } = await fetchText(url, 200);
      const payload = JSON.parse(body);

      assert(Array.isArray(payload.files), "Export payload missing files array");
      assert(payload.files.length === 4, "Expected 4 export files");

      for (const fragment of requiredFiles) {
        assert(
          payload.files.some((file) => typeof file.name === "string" && file.name.includes(fragment)),
          `Missing file containing: ${fragment}`,
        );
      }

      const membersExport = payload.files.find((file) => file.name.includes("members-export"));
      const vendorsExport = payload.files.find((file) => file.name.includes("vendors-export"));
      const frontPagesExport = payload.files.find((file) => file.name.includes("front-pages-export"));

      assert(typeof membersExport?.content === "string", "Members export content missing");
      assert(typeof vendorsExport?.content === "string", "Vendors export content missing");
      assert(typeof frontPagesExport?.content === "string", "Front pages export content missing");

      membersRows = parseCsv(membersExport.content);
      vendorsRows = parseCsv(vendorsExport.content);

      assert(membersRows.length > 1, "Members export should include data rows");
      assert(vendorsRows.length > 1, "Vendors export should include data rows");

      const frontJson = JSON.parse(frontPagesExport.content);
      assert(frontJson && typeof frontJson === "object", "Front pages export is invalid JSON");
    }),
  );

  steps.push(
    await runStep("PD search and filter return expected records", async () => {
      assert(membersRows.length > 1, "Members export rows were not prepared");
      assert(vendorsRows.length > 1, "Vendors export rows were not prepared");

      const membersHeader = membersRows[0];
      const memberNameIndex = membersHeader.indexOf("full_name");
      assert(memberNameIndex >= 0, "Members export missing full_name column");
      const sampleMember = membersRows[1][memberNameIndex] || "";
      const memberToken = sampleMember.split(/[,\s]+/).find((part) => part.length >= 3) || sampleMember;
      assert(memberToken, "Could not derive member search token");

      const memberSearch = await fetchText(
        buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=members&q=${encodeURIComponent(memberToken)}`),
        200,
      );
      assert(
        includesCaseInsensitive(memberSearch.body, memberToken),
        `Member search token not present in members view: ${memberToken}`,
      );

      const vendorHeader = vendorsRows[0];
      const vendorCategoryIndex = vendorHeader.indexOf("category");
      const vendorNameIndex = vendorHeader.indexOf("business_name");
      assert(vendorCategoryIndex >= 0 && vendorNameIndex >= 0, "Vendor export missing required columns");

      const sampleVendorCategory = vendorsRows[1][vendorCategoryIndex] || "";
      const sampleVendorName = vendorsRows[1][vendorNameIndex] || "";
      assert(sampleVendorCategory, "Could not derive vendor category");
      assert(sampleVendorName, "Could not derive vendor name");

      const vendorView = await fetchText(
        buildUrl(
          `/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=vendors&category=${encodeURIComponent(sampleVendorCategory)}`,
        ),
        200,
      );
      assert(
        includesCaseInsensitive(vendorView.body, sampleVendorName),
        `Vendor filter did not include expected business: ${sampleVendorName}`,
      );
    }),
  );

  steps.push(
    await runStep("PD quality report matches export counts", async () => {
      assert(membersRows.length > 0, "Members export rows were not prepared");
      assert(vendorsRows.length > 0, "Vendors export rows were not prepared");

      const url = buildUrl(`/api/pd/export?k=${encodeURIComponent(PD_KEY)}&scope=quality`);
      const { body } = await fetchText(url, 200);
      const payload = JSON.parse(body);

      assert(Array.isArray(payload.files) && payload.files.length === 1, "Quality scope should return one file");

      const qualityRaw = payload.files[0]?.content;
      assert(typeof qualityRaw === "string", "Quality file content missing");

      const quality = JSON.parse(qualityRaw);
      assert(quality?.summary, "Quality report summary missing");
      assert(Array.isArray(quality?.issues), "Quality report issues should be an array");

      const expectedMembers = Math.max(membersRows.length - 1, 0);
      const expectedVendors = Math.max(vendorsRows.length - 1, 0);

      assert(
        quality.summary.members_total === expectedMembers,
        `members_total mismatch: expected ${expectedMembers}, got ${quality.summary.members_total}`,
      );
      assert(
        quality.summary.vendors_total === expectedVendors,
        `vendors_total mismatch: expected ${expectedVendors}, got ${quality.summary.vendors_total}`,
      );
      assert(
        quality.summary.issues_total === quality.issues.length,
        "issues_total does not match issues array length",
      );
    }),
  );

  steps.push(
    await runStep("Application portal check", async () => {
      await checkExternalPage("Application portal", APP_URL, APP_EXPECT_TEXT);
    }),
  );

  steps.push(
    await runStep("Committee portal check", async () => {
      await checkExternalPage("Committee portal", COMMITTEE_URL, COMMITTEE_EXPECT_TEXT);
    }),
  );

  const passed = steps.filter(Boolean).length;
  const failed = steps.length - passed;

  console.log(`\nWorkflow result: ${passed}/${steps.length} passed`);

  if (failed > 0) {
    process.exit(1);
  }

  const membersCsvPath = path.join(process.cwd(), "content/pd/members-2024.csv");
  const vendorsCsvPath = path.join(process.cwd(), "content/pd/vendors-2024.csv");
  if (fs.existsSync(membersCsvPath) && fs.existsSync(vendorsCsvPath)) {
    console.log("CSV source files detected and validated through export checks.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
