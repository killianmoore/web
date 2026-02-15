import { NextResponse } from "next/server";
import {
  buildDataQualityReportJson,
  buildFrontPagesExportJson,
  buildMembersExportCsv,
  buildVendorsExportCsv,
} from "@/lib/pd-export";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedKey = url.searchParams.get("k");
  const scope = url.searchParams.get("scope");
  const expectedKey = process.env.PD_LAB_KEY;

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generatedAt = new Date().toISOString().replace(/[:.]/g, "-");
  const qualityFile = {
    name: `data-quality-report-${generatedAt}.json`,
    mime: "application/json;charset=utf-8",
    content: buildDataQualityReportJson(),
  };

  if (scope === "quality") {
    return NextResponse.json({
      generatedAt,
      files: [qualityFile],
    });
  }

  return NextResponse.json({
    generatedAt,
    files: [
      {
        name: `members-export-${generatedAt}.csv`,
        mime: "text/csv;charset=utf-8",
        content: buildMembersExportCsv(),
      },
      {
        name: `vendors-export-${generatedAt}.csv`,
        mime: "text/csv;charset=utf-8",
        content: buildVendorsExportCsv(),
      },
      {
        name: `front-pages-export-${generatedAt}.json`,
        mime: "application/json;charset=utf-8",
        content: buildFrontPagesExportJson(),
      },
      qualityFile,
    ],
  });
}
