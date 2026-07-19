import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatINR } from "@/lib/utils";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ledger")({
  component: AdminLedgerPage,
});

function AdminLedgerPage() {
  const ledger = useQuery(api.reports.getLedger);

  const exportCSV = () => {
    if (!ledger || ledger.length === 0) return;
    
    const headers = ["Vehicle,Status,Purchase Date,Purchase Price,Sold Date,Sold Price,Profit,Margin,Source"];
    const rows = ledger.map(item => {
      return [
        `${item.year} ${item.make} ${item.model}`,
        item.status,
        item.purchase_date || "N/A",
        item.purchase_price,
        item.sold_date || "N/A",
        item.sold_price,
        item.profit,
        item.margin.toFixed(2) + "%",
        `"${item.source || ''}"`
      ].join(",");
    });
    
    const csv = headers.concat(rows).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `shyn-ride-ledger-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Ledger exported successfully");
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Ledger</h1>
          <p className="mt-1 text-sm text-text-secondary">Internal financial tracking and profit margins.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!ledger || ledger.length === 0}
          className="flex items-center gap-2 rounded-lg bg-surface border border-border px-5 py-2.5 text-sm font-bold text-text-primary transition-all hover:bg-border/50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="mt-8 overflow-x-auto border border-border rounded-2xl bg-surface">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
          <thead className="border-b border-border bg-background">
            <tr>
              <th className="px-6 py-4 font-medium text-text-tertiary">Vehicle</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Dates</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Purchase</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Sold</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Profit</th>
              <th className="px-6 py-4 font-medium text-text-tertiary">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {ledger === undefined ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-text-tertiary">
                  <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-ui border-t-transparent" /></div>
                </td>
              </tr>
            ) : ledger.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-border mb-3" />
                    <p className="text-text-primary font-medium">No ledger entries yet</p>
                    <p className="text-sm text-text-tertiary mt-1">Add purchase/sold data to cars in inventory.</p>
                  </div>
                </td>
              </tr>
            ) : (
              ledger.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-border/30">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text-primary">
                      {item.year} {item.make} {item.model}
                    </div>
                    <div className="text-xs text-text-tertiary mt-0.5">
                      Status: <span className={item.status === "sold" ? "text-emerald-500 font-medium uppercase" : "text-gold-ui font-medium uppercase"}>{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-text-secondary">Bought: {item.purchase_date ? format(new Date(item.purchase_date), "MMM d, yyyy") : "-"}</div>
                    <div className="text-xs text-text-secondary mt-1">Sold: {item.sold_date ? format(new Date(item.sold_date), "MMM d, yyyy") : "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary tabular-nums">
                      {item.purchase_price ? formatINR(item.purchase_price) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary tabular-nums">
                      {item.sold_price ? formatINR(item.sold_price) : "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "sold" && item.purchase_price && item.sold_price ? (
                      <div className={`font-bold tabular-nums flex items-center gap-1 ${item.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {item.profit >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {formatINR(Math.abs(item.profit))}
                      </div>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "sold" && item.purchase_price && item.sold_price ? (
                      <div className={`text-sm font-bold tabular-nums ${item.margin >= 10 ? "text-emerald-500" : item.margin > 0 ? "text-gold-ui" : "text-red-500"}`}>
                        {item.margin.toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-text-tertiary">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
