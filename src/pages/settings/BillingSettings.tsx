import { useState } from "react";
import { CreditCard, DollarSign, Receipt, FileText, Plus, MoreVertical, Check, AlertCircle } from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export function BillingSettings() {
  const { currencySymbol } = useSettings();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
    { id: 2, type: "Mastercard", last4: "8888", expiry: "08/24", isDefault: false },
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-2023-001", date: "2023-11-01", amount: "1,250.00", status: "Paid" },
    { id: "INV-2023-002", date: "2023-12-01", amount: "1,250.00", status: "Pending" },
  ]);

  const handleAddPaymentMethod = () => {
    toast.info("Add Payment Method dialog would open here");
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}...`);
  };

  return (
    <div className="space-y-6">
      <div className="card-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Methods</h2>
          </div>
          <button 
            onClick={handleAddPaymentMethod}
            className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                  {method.type}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">•••• •••• •••• {method.last4}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Expires {method.expiry}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Receipt className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Billing History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="pb-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{invoice.id}</td>
                  <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{invoice.date}</td>
                  <td className="py-4 text-sm font-bold text-slate-900 dark:text-white">{currencySymbol}{invoice.amount}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      invoice.status === 'Paid' 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
                    )}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button 
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
