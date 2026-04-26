import type { PayloadSeed } from "@/lib/schemas/core";
import { Badge } from "@/components/ui";

export function PayloadExplorer({ payloads }: { payloads: PayloadSeed[] }) {
  return (
    <div className="overflow-auto rounded border border-line bg-white">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-field text-xs uppercase tracking-wide text-ink/60">
          <tr>
            <th className="px-3 py-3">Payload</th>
            <th className="px-3 py-3">Surface</th>
            <th className="px-3 py-3">Family</th>
            <th className="px-3 py-3">Origin</th>
            <th className="px-3 py-3">Protected Action</th>
          </tr>
        </thead>
        <tbody>
          {payloads.map((payload) => (
            <tr key={payload.id} className="border-t border-line">
              <td className="px-3 py-3 font-semibold">{payload.id}</td>
              <td className="px-3 py-3">{payload.surface}</td>
              <td className="px-3 py-3">{payload.family}</td>
              <td className="px-3 py-3">
                <Badge tone={payload.origin === "user" ? "good" : "warn"}>
                  {payload.origin}
                </Badge>
              </td>
              <td className="px-3 py-3">{payload.expectedProtectedAction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
