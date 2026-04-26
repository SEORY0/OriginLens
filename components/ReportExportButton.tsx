"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";

export function ReportExportButton({
  runId = "latest",
  format = "csv",
  label
}: {
  runId?: string;
  format?: "csv" | "json";
  label?: string;
}) {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        window.location.href = `/api/report/export?runId=${encodeURIComponent(runId)}&format=${format}`;
      }}
    >
      <Download size={16} />
      {label ?? `Export ${format.toUpperCase()}`}
    </Button>
  );
}
