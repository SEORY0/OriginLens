import { Badge } from "@/components/ui";
import type { PolicyMatrixResponse } from "@/lib/python-client";

export function PolicyMatrix({ policies }: { policies: PolicyMatrixResponse }) {
  return (
    <div className="overflow-auto rounded border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-field text-xs uppercase tracking-wide text-ink/60">
          <tr>
            <th className="px-3 py-3">Protected Action</th>
            <th className="px-3 py-3">Required</th>
            <th className="px-3 py-3">Denied</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(policies)
            .filter(([key]) => key !== "none")
            .map(([key, policy]) => (
              <tr className="border-t border-line" key={key}>
                <td className="px-3 py-3 font-semibold">{policy.label}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    {policy.requiredOrigins.map((origin) => (
                      <Badge tone="good" key={origin}>
                        {origin}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    {policy.deniedOrigins.map((origin) => (
                      <Badge tone="bad" key={origin}>
                        {origin}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
