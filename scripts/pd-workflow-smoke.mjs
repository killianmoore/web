#!/usr/bin/env node

const BASE_URL = process.env.PD_TEST_BASE_URL || "http://127.0.0.1:3000";
const PD_KEY = process.env.PD_LAB_KEY || "";
const APP_URL = process.env.PD_APPLICATION_URL || "";
const APP_EXPECT_TEXT = process.env.PD_APPLICATION_EXPECT_TEXT || "";
const COMMITTEE_URL = process.env.PD_COMMITTEE_URL || "";
const COMMITTEE_EXPECT_TEXT = process.env.PD_COMMITTEE_EXPECT_TEXT || "";
const REQUIRE_EXTERNAL = process.env.PD_REQUIRE_EXTERNAL === "1";
const REQUEST_TIMEOUT_MS = Number(process.env.PD_TEST_TIMEOUT_MS || 15000);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildUrl(input) {
  return new URL(input, BASE_URL).toString();
}

function includesCaseInsensitive(haystack, needle) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
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
      if (row.some((v) => v.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some((v) => v.length > 0)) rows.push(row);
  }

  return rows;
}

async function fetchText(url, expectedStatus = 200) {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const body = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url}, got ${response.status}`);
  }
  return { response, body };
}

async function runStep(name, fn) {
  const start = Date.now();
  try {
    await fn();
    console.log(`PASS ${name} (${Date.now() - start}ms)`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name} (${Date.now() - start}ms)`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function assertBaseReachable() {
  try {
    await fetchText(buildUrl("/"), 200);
  } catch (error) {
    throw new Error(
      `Base URL is unreachable (${BASE_URL}). Start app or set PD_TEST_BASE_URL. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function checkExternal(label, url, expectedText) {
  if (!url) {
    if (REQUIRE_EXTERNAL) throw new Error(`${label} URL is required but missing`);
    console.log(`SKIP ${label} (URL not configured)`);
    return;
  }
  const { body } = await fetchText(url, 200);
  if (expectedText) {
    assert(includesCaseInsensitive(body, expectedText), `${label} missing expected text: ${expectedText}`);
  }
}

async function main() {
  if (!PD_KEY) {
    console.error("PD_LAB_KEY is required.");
    console.error("Example: PD_LAB_KEY=... npm run test:pd:workflow");
    process.exit(1);
  }

  await assertBaseReachable();

  let membersRows = [];
  let vendorsRows = [];

  const results = [];

  results.push(await runStep("PD lab rejects missing key", async () => {
    await fetchText(buildUrl("/pd-lab"), 404);
  }));

  results.push(await runStep("PD front, members, vendors pages render", async () => {
    const front = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=front`), 200);
    assert(front.body.includes("ROLL OF HONOR"), "Missing front heading");

    const members = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=members`), 200);
    assert(members.body.includes("MEMBERS DIRECTORY"), "Members heading missing");

    const vendors = await fetchText(buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=vendors`), 200);
    assert(vendors.body.includes("VENDOR DIRECTORY"), "Vendors heading missing");
  }));

  results.push(await runStep("PD export auth check", async () => {
    const { body } = await fetchText(buildUrl("/api/pd/export"), 401);
    const json = JSON.parse(body);
    assert(json.error === "Unauthorized", "Unauthorized payload mismatch");
  }));

  results.push(await runStep("PD export payload check", async () => {
    const { body } = await fetchText(buildUrl(`/api/pd/export?k=${encodeURIComponent(PD_KEY)}`), 200);
    const payload = JSON.parse(body);
    assert(Array.isArray(payload.files), "files missing");

    const membersFile = payload.files.find((f) => f.name.includes("members-export"));
    const vendorsFile = payload.files.find((f) => f.name.includes("vendors-export"));
    const frontFile = payload.files.find((f) => f.name.includes("front-pages-export"));
    const qualityFile = payload.files.find((f) => f.name.includes("data-quality-report"));

    assert(membersFile && vendorsFile && frontFile && qualityFile, "Missing one or more export files");

    membersRows = parseCsv(membersFile.content);
    vendorsRows = parseCsv(vendorsFile.content);
    assert(membersRows.length > 1, "Members CSV has no rows");
    assert(vendorsRows.length > 1, "Vendors CSV has no rows");

    JSON.parse(frontFile.content);
    JSON.parse(qualityFile.content);
  }));

  results.push(await runStep("PD search/filter check", async () => {
    assert(membersRows.length > 1 && vendorsRows.length > 1, "CSV rows unavailable");

    const memberHeader = membersRows[0];
    const memberNameIndex = memberHeader.indexOf("full_name");
    assert(memberNameIndex >= 0, "full_name header missing");
    const memberToken = (membersRows[1][memberNameIndex] || "").split(/[\s,]+/).find((w) => w.length >= 3) || "";
    assert(memberToken, "Could not derive member token");

    const membersResult = await fetchText(
      buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=members&q=${encodeURIComponent(memberToken)}`),
      200,
    );
    assert(includesCaseInsensitive(membersResult.body, memberToken), "Member query token not visible");

    const vendorHeader = vendorsRows[0];
    const categoryIdx = vendorHeader.indexOf("category");
    const businessIdx = vendorHeader.indexOf("business_name");
    assert(categoryIdx >= 0 && businessIdx >= 0, "Vendor CSV headers missing");

    const category = vendorsRows[1][categoryIdx] || "";
    const name = vendorsRows[1][businessIdx] || "";
    assert(category && name, "Could not derive vendor category/name");

    const vendorView = await fetchText(
      buildUrl(`/pd-lab?k=${encodeURIComponent(PD_KEY)}&mode=vendors&category=${encodeURIComponent(category)}`),
      200,
    );
    assert(includesCaseInsensitive(vendorView.body, name), "Expected vendor missing from category view");
  }));

  results.push(await runStep("PD quality scope check", async () => {
    const { body } = await fetchText(buildUrl(`/api/pd/export?k=${encodeURIComponent(PD_KEY)}&scope=quality`), 200);
    const payload = JSON.parse(body);
    assert(Array.isArray(payload.files) && payload.files.length === 1, "Quality scope should return one file");

    const quality = JSON.parse(payload.files[0].content);
    const expectedMembers = membersRows.length - 1;
    const expectedVendors = vendorsRows.length - 1;

    assert(quality.summary.members_total === expectedMembers, "members_total mismatch");
    assert(quality.summary.vendors_total === expectedVendors, "vendors_total mismatch");
    assert(quality.summary.issues_total === quality.issues.length, "issues_total mismatch");
  }));

  results.push(await runStep("Application portal check", async () => {
    await checkExternal("Application portal", APP_URL, APP_EXPECT_TEXT);
  }));

  results.push(await runStep("Committee portal check", async () => {
    await checkExternal("Committee portal", COMMITTEE_URL, COMMITTEE_EXPECT_TEXT);
  }));

  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;

  console.log(`\nWorkflow result: ${passed}/${results.length} passed`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
