import { BarChart2, FileText, Download, Printer } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from "../../lib/db";
import { toast } from "sonner";

export function PharmacyReports() {
  const generateInventoryReport = async () => {
    const inventory = await db.pharmacy_inventory.toArray();
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text("Pharmacy Inventory Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const inventoryData = inventory.map(item => [
      item.medicationName,
      item.unit,
      item.stock.toString(),
      `$${item.price.toFixed(2)}`,
      item.stock <= 0 ? "Out of Stock" : item.stock <= item.minStock ? "Low Stock" : "In Stock"
    ]);

    autoTable(doc, {
      head: [['Medication Name', 'Unit', 'Stock', 'Price', 'Status']],
      body: inventoryData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`pharmacy-inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateSalesReport = async () => {
    const prescriptions = await db.prescriptions.where('status').equals('completed').toArray();
    const patients = await db.patients.toArray();
    const prescriptionItems = await db.prescription_items.toArray();
    const inventory = await db.pharmacy_inventory.toArray();
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Pharmacy Sales Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Period: All Time (Completed Orders)`, 14, 30);

    const salesData = prescriptions.map(rx => {
      const patient = patients.find(p => p.id === rx.patientId || String(p.localId) === rx.patientId);
      const items = prescriptionItems.filter(item => item.prescriptionId === rx.id || item.prescriptionId === String(rx.localId));
      
      const total = items.reduce((sum, item) => {
        const invItem = inventory.find(i => i.medicationName === item.medicationName);
        return sum + (invItem?.price || 0);
      }, 0);

      return [
        rx.id || `LOCAL-${rx.localId}`,
        patient?.name || "Unknown Patient",
        new Date(rx.createdAt).toLocaleDateString(),
        `$${total.toFixed(2)}`,
        "Completed"
      ];
    });

    autoTable(doc, {
      head: [['Order ID', 'Patient', 'Date', 'Total', 'Status']],
      body: salesData,
      startY: 40,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Summary
    const totalRevenue = salesData.reduce((acc, curr) => acc + parseFloat(curr[3].replace('$', '')), 0);
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, finalY + 20);

    doc.save(`pharmacy-sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-slate-500">Generate and export pharmacy reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory Report Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Inventory Status Report</h3>
          <p className="text-slate-500 text-sm mb-6">
            Detailed breakdown of current stock levels, low stock alerts, and inventory valuation.
          </p>
          <button 
            onClick={generateInventoryReport}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        {/* Sales Report Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
            <BarChart2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Sales & Revenue Report</h3>
          <p className="text-slate-500 text-sm mb-6">
            Financial summary of medication sales, revenue trends, and transaction history.
          </p>
          <button 
            onClick={generateSalesReport}
            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Recently Generated Reports</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Monthly Inventory Audit</h4>
                  <p className="text-xs text-slate-500">Generated on Oct {25 - i}, 2023</p>
                </div>
              </div>
              <button 
                onClick={() => toast.info("Printing functionality coming soon!")}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
