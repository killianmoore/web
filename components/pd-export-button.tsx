"use client";

import { useState } from "react";

type ExportFile = {
  name: string;
  mime: string;
  content: string;
};

type ExportResponse = {
  generatedAt: string;
  files: ExportFile[];
};

type Props = {
  accessKey: string;
};

function downloadFile(file: ExportFile) {
  const blob = new Blob([file.content], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function PDExportButton({ accessKey }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState<string>("");

  const runExport = async (scope?: "quality") => {
    setIsExporting(true);
    setMessage("");

    try {
      const params = new URLSearchParams();
      params.set("k", accessKey);
      if (scope) params.set("scope", scope);
      const response = await fetch(`/api/pd/export?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const payload = (await response.json()) as ExportResponse;
      for (const file of payload.files) {
        downloadFile(file);
      }

      setMessage(
        scope === "quality"
          ? "Exported data quality report"
          : `Exported ${payload.files.length} files`,
      );
    } catch {
      setMessage("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="pd-export-row">
      <div className="pd-export-actions">
        <button
          className="pd-export-button"
          type="button"
          onClick={() => runExport()}
          disabled={isExporting}
        >
          {isExporting ? "Exporting..." : "Export Current Data"}
        </button>
        <button
          className="pd-export-button"
          type="button"
          onClick={() => runExport("quality")}
          disabled={isExporting}
        >
          Export Quality Report
        </button>
      </div>
      {message ? <p className="pd-export-note">{message}</p> : null}
    </div>
  );
}
