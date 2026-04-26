"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui";

export function ReportExportButton({ runId = "latest" }: { runId?: string }) {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        window.location.href = `/api/report/export?runId=${encodeURIComponent(runId)}&format=csv`;
      }}
    >
      <Download size={16} />
      Export CSV
    </Button>
  );
}
