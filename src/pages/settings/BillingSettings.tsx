import { useState } from "react";
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  FileText, 
  Plus, 
  Check, 
  AlertCircle, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Building, 
  Sparkles, 
  Calendar, 
  X, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Layers, 
  RefreshCw,
  CheckCircle2,
  Clock,
  HelpCircle
} from "lucide-react";
import { useSettings } from "../../lib/SettingsContext";
import { useUser } from "../../lib/UserContext";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  type: "Visa" | "Mastercard" | "American Express" | "Bank ACH";
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  period: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  itemsCount: number;
  pdfUrl?: string;
}

export function BillingSettings() {
  const { currencySymbol, compactMode } = useSettings();
  const { profile } = useUser();

  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || "Medical Center Admin";

  // Subscription Plan Info
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  
  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "pm-1", type: "Visa", last4: "4242", expiry: "12/28", holderName: fullName, isDefault: true },
    { id: "pm-2", type: "Mastercard", last4: "8888", expiry: "08/26", holderName: "Accounting Dept", isDefault: false },
    { id: "pm-3", type: "Bank ACH", last4: "1092", expiry: "N/A", holderName: "First National Health Corp", isDefault: false }
  ]);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-2026-008", date: "2026-08-01", period: "Aug 2026", amount: 1250.00, status: "Paid", itemsCount: 45 },
    { id: "INV-2026-007", date: "2026-07-01", period: "Jul 2026", amount: 1250.00, status: "Paid", itemsCount: 42 },
    { id: "INV-2026-006", date: "2026-06-01", period: "Jun 2026", amount: 1250.00, status: "Paid", itemsCount: 40 },
    { id: "INV-2026-005", date: "2026-05-01", period: "May 2026", amount: 1250.00, status: "Paid", itemsCount: 38 },
    { id: "INV-2026-004", date: "2026-04-01", period: "Apr 2026", amount: 1100.00, status: "Paid", itemsCount: 35 }
  ]);

  // Modals & Controls State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [searchInvoiceQuery, setSearchInvoiceQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  const [newCard, setNewCard] = useState({
    type: "Visa" as PaymentMethod['type'],
    number: "",
    expiry: "",
    cvc: "",
    holderName: fullName
  });

  // Tax Details
  const [taxDetails, setTaxDetails] = useState({
    taxId: "EIN-88-3920192",
    billingEmail: profile.email || "billing@medicalcenter.org",
    billingAddress: "742 Evergreen Terrace, Suite 400, Springfield, IL 62701"
  });
  const [isSavingTax, setIsSavingTax] = useState(false);

  // Handlers
  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.number || !newCard.expiry) {
      toast.error("Please enter a valid card number and expiration date.");
      return;
    }

    const last4 = newCard.number.slice(-4) || "9999";
    const methodToAdd: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: newCard.type,
      last4,
      expiry: newCard.expiry,
      holderName: newCard.holderName,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, methodToAdd]);
    setIsAddingPayment(false);
    setNewCard({ type: "Visa", number: "", expiry: "", cvc: "", holderName: fullName });
    toast.success(`Payment method ending in ${last4} added successfully.`);
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
    toast.success("Default payment method updated.");
  };

  const handleRemovePayment = (id: string) => {
    if (paymentMethods.find(pm => pm.id === id)?.isDefault && paymentMethods.length > 1) {
      toast.error("Please assign a new default payment method before removing this card.");
      return;
    }
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.info("Payment method removed.");
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceContent = {
      invoiceNumber: invoice.id,
      clinic: profile.clinicName,
      clinicId: profile.clinicId,
      date: invoice.date,
      billingPeriod: invoice.period,
      amountPaid: `${currencySymbol}${invoice.amount.toFixed(2)}`,
      status: invoice.status,
      taxId: taxDetails.taxId,
      billingAddress: taxDetails.billingAddress,
      billingEmail: taxDetails.billingEmail,
      lineItems: [
        { item: "EMR Workspace Core Subscription (Multi-Clinician)", amount: `${currencySymbol}950.00` },
        { item: "Gemini Clinical AI Assistant Token Quota", amount: `${currencySymbol}200.00` },
        { item: "Firestore Cloud Sync & Backup Vault", amount: `${currencySymbol}100.00` }
      ]
    };

    const blob = new Blob([JSON.stringify(invoiceContent, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${invoice.id}-${profile.clinicName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Invoice ${invoice.id} exported successfully.`);
  };

  const handleSaveTaxDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTax(true);
    setTimeout(() => {
      setIsSavingTax(false);
      toast.success("Billing & Tax information updated successfully.");
    }, 400);
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(searchInvoiceQuery.toLowerCase()) || 
                          inv.period.toLowerCase().includes(searchInvoiceQuery.toLowerCase());
    const matchesStatus = selectedStatusFilter === "all" || inv.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalYtdSpending = invoices.reduce((acc, curr) => acc + (curr.status === "Paid" ? curr.amount : 0), 0);
  const pendingAmount = invoices.filter(i => i.status === "Pending").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-900/40 dark:text-indigo-400">
              <Building className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Financial & Subscription Management
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Billing & Invoicing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage workspace licenses, active subscription plans, payment methods, and downloadable invoices for <strong className="text-indigo-600 dark:text-indigo-400">{profile.clinicName}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsAddingPayment(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-2 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Payment Method
        </button>
      </div>

      {/* Subscription Tier Overview Card */}
      <div className="card-panel p-6 bg-gradient-to-r from-indigo-900/10 via-slate-900/10 to-indigo-900/10 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-200/80 dark:border-indigo-800/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
                Active Plan
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                Workspace ID: {profile.clinicId}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Enterprise Clinical EMR & AI Assistant Tier
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Includes unlimited clinical users, 24/7 Firestore cloud persistence, Gemini Clinical AI, Pharmacy Inventory, and Automated Backup snapshots.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer",
                billingCycle === "monthly" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer",
                billingCycle === "annual" 
                  ? "bg-indigo-600 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Annual
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Rate</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {currencySymbol}{billingCycle === "annual" ? "1,250.00" : "1,500.00"} / mo
            </span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Next Renewal Date</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">September 1, 2026</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">YTD Invoiced</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {currencySymbol}{totalYtdSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Pending Balance</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              {currencySymbol}{pendingAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="card-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payment Methods</h2>
          </div>
          <button 
            onClick={() => setIsAddingPayment(true)}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={cn(
                "p-4 rounded-2xl border transition-all relative flex flex-col justify-between space-y-3",
                method.isDefault 
                  ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-xs" 
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-xs text-indigo-600 dark:text-indigo-400 shadow-2xs">
                    {method.type === 'Bank ACH' ? 'ACH' : method.type}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      •••• •••• {method.last4}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Exp: {method.expiry}
                    </p>
                  </div>
                </div>

                {method.isDefault ? (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefaultPayment(method.id)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
                <span className="truncate max-w-[150px] font-medium">{method.holderName}</span>
                <button
                  onClick={() => handleRemovePayment(method.id)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove payment method"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax & Invoicing Details Form */}
      <div className="card-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tax & Invoice Details</h2>
          </div>
        </div>

        <form onSubmit={handleSaveTaxDetails} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Clinic Tax ID / EIN *
            </label>
            <input
              type="text"
              value={taxDetails.taxId}
              onChange={(e) => setTaxDetails({ ...taxDetails, taxId: e.target.value })}
              className="w-full p-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Billing Contact Email *
            </label>
            <input
              type="email"
              value={taxDetails.billingEmail}
              onChange={(e) => setTaxDetails({ ...taxDetails, billingEmail: e.target.value })}
              className="w-full p-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Billing Physical Address
            </label>
            <input
              type="text"
              value={taxDetails.billingAddress}
              onChange={(e) => setTaxDetails({ ...taxDetails, billingAddress: e.target.value })}
              className="w-full p-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSavingTax}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
            >
              {isSavingTax ? "Saving..." : "Save Invoice Details"}
            </button>
          </div>
        </form>
      </div>

      {/* Invoicing History Table */}
      <div className="card-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Billing & Invoice History</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice ID or period..."
                value={searchInvoiceQuery}
                onChange={(e) => setSearchInvoiceQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Period</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Date</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No billing invoices match your search filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                      {invoice.id}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {invoice.period}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {invoice.date}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-black text-slate-900 dark:text-white">
                      {currencySymbol}{invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1",
                        invoice.status === 'Paid' 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                          : invoice.status === 'Pending'
                          ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                          : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
                      )}>
                        {invoice.status === 'Paid' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3 text-amber-500" />}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" /> Export Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {isAddingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Payment Method</h3>
              </div>
              <button 
                onClick={() => setIsAddingPayment(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Card Type / Method *
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value as PaymentMethod['type'] })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Visa">Visa Credit/Debit</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Bank ACH">Bank Direct ACH Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Card or Account Holder Name *
                </label>
                <input
                  type="text"
                  value={newCard.holderName}
                  onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Card Number / Account Number *
                </label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 8888"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Security Code (CVC)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                    className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingPayment(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  Save Payment Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
