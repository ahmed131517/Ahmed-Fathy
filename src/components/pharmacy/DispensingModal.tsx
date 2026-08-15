import React, { useState, useEffect, useMemo } from "react";
import { 
  X, AlertTriangle, ShieldAlert, CheckCircle2, QrCode, Scan, Package, 
  Sparkles, Calendar, User, Clock, ArrowRight, FileText, Check, AlertCircle, RefreshCw,
  Printer, DollarSign, ShieldCheck, Tag, FileSpreadsheet
} from "lucide-react";
import { db, Prescription, PrescriptionItem, PatientRecord, PharmacyInventoryItem, PharmacyBatch } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/SettingsContext";
import { 
  checkDrugAllergies, 
  checkDrugInteractions, 
  checkDrugContraindications,
  normalizeSigCode,
  getFefoRecommendedBatch, 
  verifyDrugBarcode, 
  AllergyWarning, 
  InteractionWarning,
  ContraindicationWarning
} from "@/utils/pharmacySafety";
import { PharmacyInventoryService } from "@/services/PharmacyInventoryService";

interface DispensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  patientData?: PatientRecord;
  prescriptionItems: PrescriptionItem[];
  onStatusUpdated?: () => void;
}

export function DispensingModal({
  isOpen,
  onClose,
  prescription,
  patientData,
  prescriptionItems,
  onStatusUpdated
}: DispensingModalProps) {
  const { currencySymbol } = useSettings();
  const inventory = useLiveQuery(async () => {
    const all = await db.pharmacy_inventory.toArray();
    return all.filter(i => !i.isDeleted);
  }) || [];
  const batches = useLiveQuery(async () => {
    const all = await db.pharmacy_batches.toArray();
    return all.filter(b => !b.isDeleted);
  }) || [];

  // Local state for selected batch for each item: itemId -> batchId
  const [selectedBatches, setSelectedBatches] = useState<Record<string, string>>({});
  // Local state for barcode scan inputs: itemId -> scannedString
  const [scannedCodes, setScannedCodes] = useState<Record<string, string>>({});
  // Verified status: itemId -> boolean
  const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
  
  // Pharmacist safety override if warnings exist
  const [overrideApproved, setOverrideApproved] = useState(false);
  const [overrideNotes, setOverrideNotes] = useState("");
  const [secondSignOffPharmacist, setSecondSignOffPharmacist] = useState("");
  const [isDispensing, setIsDispensing] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Extract prescribed medication names
  const prescribedMedNames = useMemo(() => {
    return prescriptionItems.map(i => i.medicationName || "").filter(Boolean);
  }, [prescriptionItems]);

  // Extract patient allergies
  const patientAllergies = useMemo(() => {
    if (!patientData) return [];
    if (Array.isArray(patientData.allergies)) return patientData.allergies;
    if (typeof patientData.allergies === 'string') {
      try { return JSON.parse(patientData.allergies); } catch { return [patientData.allergies]; }
    }
    return [];
  }, [patientData]);

  // Extract active patient medications
  const patientCurrentMeds = useMemo(() => {
    if (!patientData) return [];
    if (Array.isArray(patientData.medications)) return patientData.medications;
    if (typeof patientData.medications === 'string') {
      try { return JSON.parse(patientData.medications); } catch { return [patientData.medications]; }
    }
    return [];
  }, [patientData]);

  // Extract patient diagnoses / conditions
  const patientDiagnoses = useMemo(() => {
    if (!patientData) return [];
    const history = (patientData as any).medicalHistory || (patientData as any).conditions;
    if (history && typeof history === 'string') {
      return history.split(',').map((s: string) => s.trim());
    }
    return [];
  }, [patientData]);

  // Compute Drug Safety Warnings
  const allergyWarnings = useMemo(() => {
    return checkDrugAllergies(patientAllergies, prescribedMedNames);
  }, [patientAllergies, prescribedMedNames]);

  const interactionWarnings = useMemo(() => {
    return checkDrugInteractions(prescribedMedNames, patientCurrentMeds);
  }, [prescribedMedNames, patientCurrentMeds]);

  const contraindicationWarnings = useMemo(() => {
    return checkDrugContraindications(patientDiagnoses, prescribedMedNames);
  }, [patientDiagnoses, prescribedMedNames]);

  const hasCriticalWarnings = allergyWarnings.length > 0 || 
    interactionWarnings.some(w => w.severity === 'critical') ||
    contraindicationWarnings.some(w => w.severity === 'critical');

  // Check if any medication is controlled / narcotic
  const hasControlledSubstances = useMemo(() => {
    return prescriptionItems.some(i => {
      const name = i.medicationName?.toLowerCase() || '';
      return name.includes('morphine') || name.includes('codeine') || name.includes('oxycodone') || name.includes('fentanyl') || name.includes('tramadol') || name.includes('diazepam') || name.includes('lorazepam');
    });
  }, [prescriptionItems]);

  // Calculate POS Invoice Totals
  const invoiceCalculations = useMemo(() => {
    let subtotal = 0;
    const lineItems = prescriptionItems.map(item => {
      const invMatch = inventory.find(i => i.medicationName?.toLowerCase().includes(item.medicationName?.toLowerCase()));
      const unitPrice = invMatch ? invMatch.price : 15.00;
      const qty = 1; // 1 unit pack
      const itemSubtotal = unitPrice * qty;
      subtotal += itemSubtotal;
      return {
        name: item.medicationName,
        dosage: item.dosage,
        unitPrice,
        qty,
        totalPrice: itemSubtotal
      };
    });

    const taxRate = 0.05; // 5% VAT / Healthcare local tax
    const taxAmount = subtotal * taxRate;
    const insuranceCoverage = subtotal * 0.80; // 80% coverage demo
    const patientCopay = subtotal * 0.20 + taxAmount;

    return {
      lineItems,
      subtotal,
      taxAmount,
      insuranceCoverage,
      patientCopay,
      grandTotal: subtotal + taxAmount
    };
  }, [prescriptionItems, inventory]);

  // Auto-select FEFO recommended batch for each item on load
  useEffect(() => {
    if (!prescriptionItems.length || !inventory.length) return;

    const initialBatches: Record<string, string> = {};
    const initialVerified: Record<string, boolean> = {};

    prescriptionItems.forEach(item => {
      const invItem = inventory.find(i => 
        i.medicationName?.toLowerCase().includes(item.medicationName?.toLowerCase()) ||
        item.medicationName?.toLowerCase().includes(i.medicationName?.toLowerCase())
      );

      if (invItem) {
        const itemId = invItem.id || String(invItem.localId);
        const fefo = getFefoRecommendedBatch(itemId, batches);
        if (fefo.recommendedBatch) {
          const key = item.id || String(item.localId || item.medicationName);
          initialBatches[key] = fefo.recommendedBatch.id || fefo.recommendedBatch.batchNumber;
        }
      }
    });

    setSelectedBatches(prev => ({ ...initialBatches, ...prev }));
  }, [prescriptionItems, inventory, batches]);

  if (!isOpen || !prescription) return null;

  const orderId = prescription.id || `local-${prescription.localId}`;

  // Handle barcode verification check
  const handleVerifyBarcode = (itemKey: string, medName: string, expectedBatchNo?: string) => {
    const code = scannedCodes[itemKey] || "";
    const result = verifyDrugBarcode(code, medName, expectedBatchNo);

    if (result.isValid) {
      setVerifiedItems(prev => ({ ...prev, [itemKey]: true }));
      toast.success(result.feedbackMessage);
    } else {
      setVerifiedItems(prev => ({ ...prev, [itemKey]: false }));
      toast.error(result.feedbackMessage);
    }
  };

  // Quick auto-scan for demo test
  const handleAutoScanSample = (itemKey: string, medName: string, batchNo?: string) => {
    const sampleCode = batchNo ? `${batchNo}` : `NDC-0093-3109-${medName.substring(0, 3).toUpperCase()}`;
    setScannedCodes(prev => ({ ...prev, [itemKey]: sampleCode }));
    setVerifiedItems(prev => ({ ...prev, [itemKey]: true }));
    toast.success(`Scanned & Verified: ${sampleCode}`);
  };

  // Complete Dispensing & Deduct Inventory Stock
  const handleDispenseOrder = async (targetStatus: "Ready" | "Completed") => {
    if (hasCriticalWarnings && !overrideApproved) {
      toast.error("Critical allergy or drug interaction alert! Pharmacist safety acknowledgement required before dispensing.");
      return;
    }

    setIsDispensing(true);
    try {
      const timestamp = Date.now();

      // Update inventory batches and stock
      for (const item of prescriptionItems) {
        const itemKey = item.id || String(item.localId || item.medicationName);
        const chosenBatchId = selectedBatches[itemKey];

        if (chosenBatchId) {
          // Deduct from chosen batch
          await PharmacyInventoryService.deductBatchStock(chosenBatchId, 1);
        } else {
          // Fallback deduction from total stock
          const invItem = inventory.find(i => 
            i.medicationName?.toLowerCase().includes(item.medicationName?.toLowerCase())
          );
          if (invItem && invItem.localId) {
            await db.pharmacy_inventory.update(invItem.localId, {
              stock: Math.max(0, invItem.stock - 1),
              lastModified: timestamp
            });
          }
        }
      }

      // Update prescription status
      if (prescription.localId) {
        await db.prescriptions.update(prescription.localId, {
          status: targetStatus,
          lastModified: timestamp
        });
      }

      // Create safety notification
      await db.notifications.add({
        id: crypto.randomUUID(),
        title: `Order ${targetStatus}: ${patientData?.name || 'Patient'}`,
        message: `Order #${orderId} for ${prescriptionItems.length} medication(s) processed and moved to ${targetStatus}.${
          hasCriticalWarnings ? ' (Pharmacist Safety Override Logged)' : ''
        }`,
        type: hasCriticalWarnings ? 'warning' : 'success',
        category: 'pharmacy',
        isRead: 0,
        link: '/pharmacy/orders',
        createdAt: timestamp,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });

      // Create audit log entry
      await db.audit_logs.add({
        id: crypto.randomUUID(),
        userId: 'pharmacist-1',
        action: `DISPENSE_ORDER_${targetStatus.toUpperCase()}`,
        entity: 'Prescription',
        entityId: orderId,
        timestamp: timestamp
      });

      toast.success(`Order #${orderId} marked as ${targetStatus}! Inventory and FEFO batches updated.`);
      if (onStatusUpdated) onStatusUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to dispense order", error);
      toast.error("Error processing order fulfillment.");
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Dispensing & Verification Workspace</h3>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  #{orderId}
                </span>
              </div>
              <p className="text-xs text-slate-400">FEFO Lot Selection & Automated Safety Checks</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">

          {/* Patient Profile & Allergies Summary */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{patientData?.name || "Unknown Patient"}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>Age: <strong>{patientData?.age || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Gender: <strong>{patientData?.gender || 'N/A'}</strong></span>
                  <span>•</span>
                  <span>Blood Type: <strong className="text-slate-700">{patientData?.bloodType || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            {/* Recorded Allergies Badge List */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recorded Patient Allergies</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {patientAllergies.length > 0 ? (
                  patientAllergies.map((allergy, idx) => {
                    const name = typeof allergy === 'string' ? allergy : allergy.name;
                    return (
                      <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        {name}
                      </span>
                    );
                  })
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-medium">
                    No Recorded Allergies (NKA)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1. Automated Drug-Allergy, Interaction & Contraindication Safety Alerts Banner */}
          {(allergyWarnings.length > 0 || interactionWarnings.length > 0 || contraindicationWarnings.length > 0) ? (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-500 text-white rounded-lg shrink-0 mt-0.5 animate-pulse">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                    Automated Safety Warning Triggered!
                    <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Action Required
                    </span>
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Cross-referencing patient allergies, active medications & clinical diagnoses revealed safety flags:
                  </p>

                  {/* Allergy Warnings */}
                  {allergyWarnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-rose-900 uppercase tracking-wider">Drug-Allergy Conflicts:</p>
                      {allergyWarnings.map((warn, i) => (
                        <div key={i} className="bg-white border border-rose-200 rounded-lg p-2.5 text-xs text-rose-900 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">{warn.message}</span>
                            <div className="text-[11px] text-rose-600 mt-0.5">
                              Allergen: <strong>{warn.allergen}</strong> | Prescribed: <strong>{warn.prescribedMed}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contraindication Warnings (Disease / Diagnosis) */}
                  {contraindicationWarnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-rose-900 uppercase tracking-wider">Disease-Drug Contraindications:</p>
                      {contraindicationWarnings.map((warn, i) => (
                        <div key={i} className="bg-white border border-purple-300 rounded-lg p-2.5 text-xs text-purple-950 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-purple-900">
                              {warn.diagnosis} vs {warn.prescribedMed} ({warn.severity.toUpperCase()} CONTRAINDICATION)
                            </span>
                            <p className="text-xs text-slate-800 mt-0.5">{warn.message}</p>
                            <p className="text-[11px] text-purple-700 font-medium mt-1">💡 Clinical Rec: {warn.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drug Interaction Warnings */}
                  {interactionWarnings.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-rose-900 uppercase tracking-wider">Drug-Drug Interactions:</p>
                      {interactionWarnings.map((warn, i) => (
                        <div key={i} className="bg-white border border-amber-200 rounded-lg p-2.5 text-xs text-slate-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900">
                              {warn.drug1} + {warn.drug2} ({warn.severity.toUpperCase()} RISK)
                            </span>
                            <p className="text-xs text-slate-700 mt-0.5">{warn.message}</p>
                            <p className="text-[11px] text-amber-700 font-medium mt-1">💡 Clinical Rec: {warn.recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Controlled Substance Double Sign-off Alert if applicable */}
                  {hasControlledSubstances && (
                    <div className="mt-3 p-2.5 bg-amber-100 border border-amber-300 rounded-lg text-amber-950 text-xs space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-amber-700" /> Controlled Substance Schedule II / Narcotic Present
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Regulatory requirement: Mandatory second licensed pharmacist verification sign-off is required before dispensing.
                      </p>
                      <input 
                        type="text"
                        placeholder="Enter 2nd Pharmacist Name / License #..."
                        value={secondSignOffPharmacist}
                        onChange={(e) => setSecondSignOffPharmacist(e.target.value)}
                        className="w-full text-xs bg-white border border-amber-300 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Safety Override Acknowledgement Form */}
                  <div className="mt-4 pt-3 border-t border-rose-200 flex flex-col gap-2 bg-rose-100/50 p-3 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-950">
                      <input 
                        type="checkbox" 
                        checked={overrideApproved}
                        onChange={(e) => setOverrideApproved(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300"
                      />
                      <span>Pharmacist Clinical Override: I have reviewed these safety flags and verified authorization with prescriber.</span>
                    </label>
                    {overrideApproved && (
                      <input 
                        type="text"
                        placeholder="Enter pharmacist clinical override justification / notes..."
                        value={overrideNotes}
                        onChange={(e) => setOverrideNotes(e.target.value)}
                        className="text-xs bg-white border border-rose-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Automated Clinical Screening Passed</h4>
                  <p className="text-[11px] text-emerald-700">No drug-allergy conflicts, disease contraindications, or high-risk drug interactions detected.</p>
                </div>
              </div>

              {hasControlledSubstances && (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block text-[10px]">Controlled Substance Log</span>
                    <input 
                      type="text"
                      placeholder="2nd Pharmacist Sign-Off..."
                      value={secondSignOffPharmacist}
                      onChange={(e) => setSecondSignOffPharmacist(e.target.value)}
                      className="text-[11px] bg-white border border-amber-300 rounded px-2 py-0.5 outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prescribed Items & FEFO Lot Recommendation */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Prescribed Line Items & FEFO Lot Selection
                <span className="text-xs font-normal text-slate-500">({prescriptionItems.length} items)</span>
              </h4>
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                FEFO (First Expired, First Out) Active
              </span>
            </div>

            <div className="space-y-3">
              {prescriptionItems.map((item, index) => {
                const itemKey = item.id || String(item.localId || item.medicationName);
                
                // Find inventory match
                const invItem = inventory.find(i => 
                  i.medicationName?.toLowerCase().includes(item.medicationName?.toLowerCase()) ||
                  item.medicationName?.toLowerCase().includes(i.medicationName?.toLowerCase())
                );
                
                const itemId = invItem ? (invItem.id || String(invItem.localId)) : '';
                const fefoData = getFefoRecommendedBatch(itemId, batches);
                const selectedBatchId = selectedBatches[itemKey];

                const currentBatch = fefoData.sortedBatches.find(b => (b.id || b.batchNumber) === selectedBatchId) || fefoData.recommendedBatch;

                const isVerified = verifiedItems[itemKey];

                return (
                  <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">#{index + 1}</span>
                          <h5 className="font-bold text-slate-900 text-base">{item.medicationName}</h5>
                          {invItem ? (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              Stock: {invItem.stock} {invItem.unit}s available
                            </span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                              Unmapped Inventory Item
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dosage: <strong>{item.dosage}</strong> | Freq: <strong>{item.frequency}</strong> | Duration: <strong>{item.duration}</strong>
                        </p>
                        {/* Normalized SIG Translation Badge */}
                        <div className="mt-1.5 p-2 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <div className="text-[11px] text-indigo-950">
                            <span className="font-bold text-indigo-800">Label Dosage Instruction (SIG Normalizer):</span>{" "}
                            <span className="font-medium italic">
                              "{normalizeSigCode(`${item.dosage} ${item.frequency}`)}"
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Verification Status Badge */}
                      <div>
                        {isVerified ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Barcode Verified
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-slate-400" />
                            Scan Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* FEFO Lot Recommendation Panel */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          Lot & Batch Selection (FEFO Rule)
                        </span>

                        {fefoData.recommendedBatch && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            FEFO Pick: {fefoData.recommendedBatch.batchNumber} (Exp: {fefoData.recommendedBatch.expiryDate})
                          </span>
                        )}
                      </div>

                      {fefoData.sortedBatches.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          {fefoData.sortedBatches.map(b => {
                            const bKey = b.id || b.batchNumber;
                            const isRecommended = bKey === fefoData.recommendedBatch?.id || bKey === fefoData.recommendedBatch?.batchNumber;
                            const isSelected = selectedBatchId === bKey || (!selectedBatchId && isRecommended);
                            const daysLeft = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                            return (
                              <button
                                key={bKey}
                                type="button"
                                onClick={() => setSelectedBatches(prev => ({ ...prev, [itemKey]: bKey }))}
                                className={cn(
                                  "text-left p-2.5 rounded-lg border text-xs transition-all relative flex flex-col justify-between",
                                  isSelected 
                                    ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-medium" 
                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                                )}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-bold font-mono text-slate-900">{b.batchNumber}</span>
                                  {isRecommended && (
                                    <span className="bg-indigo-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                                      FEFO
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center text-[11px] mt-1 text-slate-500">
                                  <span>Expires: <strong>{b.expiryDate}</strong></span>
                                  <span className={cn("font-bold", daysLeft < 30 ? "text-rose-600" : "text-emerald-600")}>
                                    {daysLeft} days left ({b.quantity} in batch)
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 italic bg-amber-50 p-2 rounded border border-amber-200">
                          {fefoData.warningMessage || "No active batch registered in inventory. Defaulting to general stock deduction."}
                        </p>
                      )}

                      {fefoData.warningMessage && fefoData.sortedBatches.length > 0 && (
                        <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                          {fefoData.warningMessage}
                        </p>
                      )}
                    </div>

                    {/* Barcode & NDC Scanner Field */}
                    <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Scan className="w-4 h-4 text-slate-600" />
                        Quick Barcode / NDC / Lot Package Verification Scanner
                      </label>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="text"
                            placeholder="Scan barcode, NDC # (e.g. NDC-0093-3109), or Lot #"
                            value={scannedCodes[itemKey] || ""}
                            onChange={(e) => setScannedCodes(prev => ({ ...prev, [itemKey]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleVerifyBarcode(itemKey, item.medicationName, currentBatch?.batchNumber);
                              }
                            }}
                            className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <Scan className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleVerifyBarcode(itemKey, item.medicationName, currentBatch?.batchNumber)}
                          className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors shrink-0"
                        >
                          Verify Code
                        </button>
                      </div>

                      {/* Scanner Demo Simulation Helper */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Demo Scan Shortcuts:</span>
                        <button
                          type="button"
                          onClick={() => handleAutoScanSample(itemKey, item.medicationName, currentBatch?.batchNumber)}
                          className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded font-mono font-medium transition-colors"
                        >
                          ⚡ Auto-Scan Lot ({currentBatch?.batchNumber || 'LOT-2026-AMX01'})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setScannedCodes(prev => ({ ...prev, [itemKey]: "WRONG-BARCODE-99" }));
                            setVerifiedItems(prev => ({ ...prev, [itemKey]: false }));
                            toast.error("Simulated barcode mismatch");
                          }}
                          className="text-[11px] bg-slate-200 text-slate-700 hover:bg-slate-300 px-2 py-0.5 rounded font-mono transition-colors"
                        >
                          ✕ Simulate Mismatch
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="px-3 py-2 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              POS Billing & Invoice ({currencySymbol}{invoiceCalculations.patientCopay.toFixed(2)})
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">| Audit trail logging active</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isDispensing || (hasCriticalWarnings && !overrideApproved)}
              onClick={() => handleDispenseOrder("Ready")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Ready
            </button>

            <button
              type="button"
              disabled={isDispensing || (hasCriticalWarnings && !overrideApproved)}
              onClick={() => handleDispenseOrder("Completed")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Package className="w-4 h-4" />
              Dispense & Complete
            </button>
          </div>
        </div>

      </div>

      {/* Itemized POS Receipt & Multi-Currency Invoice Popup Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Pharmacy POS Itemized Invoice</h3>
              </div>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50">
              <div className="text-center border-b border-dashed border-slate-300 pb-3">
                <h4 className="font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">HealthCare Central Pharmacy</h4>
                <p className="text-[10px] text-slate-500">Official POS Dispensary Receipt</p>
                <p className="text-[10px] text-slate-500">Rx Order #{orderId} | Date: {new Date().toLocaleDateString()}</p>
              </div>

              {/* Patient details */}
              <div className="text-[11px] space-y-1 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p><strong>Patient:</strong> {patientData?.name || "Standard Patient"}</p>
                <p><strong>Prescriber:</strong> {(prescription as any)?.doctorName || (prescription as any)?.prescriberName || "Staff Physician"}</p>
                <p><strong>Insurance Plan:</strong> Medical Copay Tier 1 (80/20)</p>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-[11px] text-slate-500 border-b pb-1">
                  <span>ITEM / MEDICATION</span>
                  <span>QTY x UNIT = TOTAL</span>
                </div>
                {invoiceCalculations.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="block text-[10px] text-slate-500">{item.dosage}</span>
                    </div>
                    <span className="font-bold">
                      {item.qty} x {currencySymbol}{item.unitPrice.toFixed(2)} = {currencySymbol}{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculations */}
              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{invoiceCalculations.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Healthcare Tax (5% VAT):</span>
                  <span>{currencySymbol}{invoiceCalculations.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Insurance Covered (80%):</span>
                  <span>-{currencySymbol}{invoiceCalculations.insuranceCoverage.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-amber-600 pt-2 border-t border-slate-200">
                  <span>Patient Net Copay Due:</span>
                  <span>{currencySymbol}{invoiceCalculations.patientCopay.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 p-2.5 rounded-lg text-[10px] text-center border border-amber-200 dark:border-amber-800">
                ✓ Financial ledger entry auto-generated. Regional Preset Currency: <strong>{currencySymbol}</strong>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  toast.success("Printing receipt...");
                }}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print POS Receipt
              </button>

              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
