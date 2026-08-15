import React, { useState, useMemo, useEffect } from "react";
import { Clock, Package, Eye, GripVertical, User, AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, Scan } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, Prescription, PrescriptionItem, PatientRecord } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { DispensingModal } from "@/components/pharmacy/DispensingModal";
import { checkDrugAllergies, checkDrugInteractions } from "@/utils/pharmacySafety";
import { PharmacyInventoryService } from "@/services/PharmacyInventoryService";

interface Order {
  id: string;
  patient: string;
  status: "Pending" | "Ready" | "Completed";
  time: string;
  itemsCount: number;
  total: number;
  rawPrescription: Prescription;
  patientData?: PatientRecord;
  prescriptionItems: PrescriptionItem[];
  hasAllergyConflict: boolean;
  hasInteractionWarning: boolean;
  warningSummary: string;
}

interface SortableItemProps {
  order: Order;
  onOpenDispensing: (order: Order) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ order, onOpenDispensing }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all group cursor-default"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{order.id}</span>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      <h3 className="font-bold text-slate-900 text-sm mb-1">{order.patient}</h3>
      
      {/* Safety Alert Badges on Order Card */}
      <div className="flex flex-wrap gap-1 mb-2">
        {order.hasAllergyConflict && (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Allergy Conflict
          </span>
        )}
        {order.hasInteractionWarning && (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Interaction Risk
          </span>
        )}
        {!order.hasAllergyConflict && !order.hasInteractionWarning && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Safety Clear
          </span>
        )}
      </div>

      {/* Medication Preview List */}
      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mb-3 space-y-1">
        {order.prescriptionItems.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex justify-between truncate">
            <span className="truncate font-medium">• {item.medicationName}</span>
            <span className="text-slate-400 shrink-0 ml-1">{item.dosage}</span>
          </div>
        ))}
        {order.prescriptionItems.length > 2 && (
          <p className="text-[10px] text-indigo-600 font-semibold text-right">+ {order.prescriptionItems.length - 2} more item(s)</p>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {order.time}</span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDispensing(order);
          }}
          className="bg-slate-900 text-white hover:bg-indigo-600 px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
        >
          <Scan className="w-3.5 h-3.5" />
          Fulfill & Scan
        </button>
      </div>
    </div>
  );
};

export function PharmacyOrders() {
  const dbPrescriptions = useLiveQuery(() => db.prescriptions.toArray()) || [];
  const dbPatients = useLiveQuery(() => db.patients.toArray()) || [];
  const dbItems = useLiveQuery(() => db.prescription_items.toArray()) || [];
  const inventory = useLiveQuery(() => db.pharmacy_inventory.toArray()) || [];

  const [selectedOrderForDispensing, setSelectedOrderForDispensing] = useState<Order | null>(null);
  const [isDispensingOpen, setIsDispensingOpen] = useState(false);

  // Seed default demo inventory batches if none exist
  useEffect(() => {
    PharmacyInventoryService.ensureSeedBatches();
  }, [inventory.length]);

  const orders = useMemo(() => {
    return dbPrescriptions.map(p => {
      const patient = dbPatients.find(pat => pat.id === p.patientId);
      const items = dbItems.filter(i => i.prescriptionId === p.id);
      
      // Calculate total price based on inventory
      let total = 0;
      items.forEach(item => {
        const invItem = inventory.find(i => i.medicationName?.toLowerCase() === item.medicationName?.toLowerCase());
        total += invItem ? invItem.price : 12;
      });

      // Drug safety evaluation
      const medNames = items.map(i => i.medicationName || "").filter(Boolean);
      
      let patientAllergies: any[] = [];
      if (patient?.allergies) {
        if (Array.isArray(patient.allergies)) patientAllergies = patient.allergies;
        else if (typeof patient.allergies === 'string') {
          try { patientAllergies = JSON.parse(patient.allergies); } catch { patientAllergies = [patient.allergies]; }
        }
      }

      let patientMeds: any[] = [];
      if (patient?.medications) {
        if (Array.isArray(patient.medications)) patientMeds = patient.medications;
        else if (typeof patient.medications === 'string') {
          try { patientMeds = JSON.parse(patient.medications); } catch { patientMeds = [patient.medications]; }
        }
      }

      const allergyWarns = checkDrugAllergies(patientAllergies, medNames);
      const interactionWarns = checkDrugInteractions(medNames, patientMeds);

      return {
        id: p.id || `local-${p.localId}`,
        patient: patient?.name || "Unknown Patient",
        status: (p.status as any) || "Pending",
        time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itemsCount: items.length,
        total: total,
        rawPrescription: p,
        patientData: patient,
        prescriptionItems: items,
        hasAllergyConflict: allergyWarns.length > 0,
        hasInteractionWarning: interactionWarns.length > 0,
        warningSummary: allergyWarns.length > 0 ? allergyWarns[0].message : (interactionWarns.length > 0 ? interactionWarns[0].message : "")
      } as Order;
    }).filter(o => ["Pending", "Ready", "Completed"].includes(o.status));
  }, [dbPrescriptions, dbPatients, dbItems, inventory]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = {
    Pending: orders.filter(o => o.status === "Pending"),
    Ready: orders.filter(o => o.status === "Ready"),
    Completed: orders.filter(o => o.status === "Completed"),
  };

  const handleOpenDispensing = (order: Order) => {
    setSelectedOrderForDispensing(order);
    setIsDispensingOpen(true);
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeOrder = orders.find(o => o.id === activeId);
    if (!activeOrder) return;

    const activeContainer = activeOrder.status;
    
    let overContainer = orders.find(o => o.id === overId)?.status;
    if (["Pending", "Ready", "Completed"].includes(overId)) {
      overContainer = overId as "Pending" | "Ready" | "Completed";
    }

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      // If order has allergy conflicts and dragging to completed, ask for dispensing modal verification
      if (activeOrder.hasAllergyConflict && overContainer !== "Pending") {
        toast.warning("Order has drug-allergy conflict! Opening safety verification workspace...");
        handleOpenDispensing(activeOrder);
        setActiveId(null);
        return;
      }

      try {
        const timestamp = Date.now();
        const prescription = activeOrder.rawPrescription;
        
        if (prescription.localId) {
          await db.prescriptions.update(prescription.localId, {
            status: overContainer,
            lastModified: timestamp
          });

          if (overContainer === "Ready" && prescription.doctorId) {
            await db.notifications.add({
              id: crypto.randomUUID(),
              title: 'Prescription Ready',
              message: `Prescription for ${activeOrder.patient} is ready for pickup.`,
              type: 'success',
              category: 'prescription',
              isRead: 0,
              link: '/clinical-overview',
              createdAt: timestamp,
              lastModified: timestamp,
              isDeleted: 0,
              isSynced: 0
            });
          }

          if (overContainer === "Completed") {
            const items = dbItems.filter(i => i.prescriptionId === prescription.id);
            for (const item of items) {
              const invItem = inventory.find(i => i.medicationName?.toLowerCase() === item.medicationName?.toLowerCase());
              if (invItem && invItem.localId) {
                const newStock = Math.max(0, invItem.stock - 1);
                await db.pharmacy_inventory.update(invItem.localId, {
                  stock: newStock,
                  lastModified: timestamp
                });
              }
            }
            toast.success(`Order ${activeId} completed and inventory updated`);
          } else {
            toast.success(`Order ${activeId} moved to ${overContainer}`);
          }
        }
      } catch (error) {
        console.error("Failed to update order status", error);
        toast.error("Failed to update order status");
      }
    }

    setActiveId(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pharmacy Dispensing & Order Queue</h2>
          <p className="text-xs text-slate-500">Automated Drug Safety, FEFO Lot Selection & Barcode Verification</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Pending Queue</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Ready for Pickup</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div> Dispensed & Completed</span>
        </div>
      </div>

      {/* Kanban Order Columns */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
          {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => (
            <div key={status} className="flex flex-col h-full bg-slate-50/80 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className={`p-3 border-b font-bold text-xs uppercase tracking-wider flex justify-between items-center ${
                status === "Pending" ? "bg-amber-50/80 border-amber-200 text-amber-800" :
                status === "Ready" ? "bg-emerald-50/80 border-emerald-200 text-emerald-800" :
                "bg-indigo-50/80 border-indigo-200 text-indigo-800"
              }`}>
                <span>{status} Orders</span>
                <span className="bg-white/80 px-2 py-0.5 rounded-full text-xs font-mono font-bold shadow-2xs">
                  {columns[status].length}
                </span>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto">
                <SortableContext 
                  id={status}
                  items={columns[status].map(o => o.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[150px]">
                    {columns[status].map((order) => (
                      <SortableItem key={order.id} order={order} onOpenDispensing={handleOpenDispensing} />
                    ))}
                    {columns[status].length === 0 && (
                      <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                        No {status.toLowerCase()} orders in queue
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-indigo-300 rounded-xl p-4 shadow-2xl rotate-2 cursor-grabbing w-72">
              {(() => {
                const order = orders.find(o => o.id === activeId);
                if (!order) return null;
                return (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{order.id}</span>
                      <GripVertical className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{order.patient}</h3>
                    <p className="text-xs text-slate-500">{order.prescriptionItems.length} medication line item(s)</p>
                  </>
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dispensing Modal */}
      {selectedOrderForDispensing && (
        <DispensingModal 
          isOpen={isDispensingOpen}
          onClose={() => {
            setIsDispensingOpen(false);
            setSelectedOrderForDispensing(null);
          }}
          prescription={selectedOrderForDispensing.rawPrescription}
          patientData={selectedOrderForDispensing.patientData}
          prescriptionItems={selectedOrderForDispensing.prescriptionItems}
          onStatusUpdated={() => {
            setIsDispensingOpen(false);
            setSelectedOrderForDispensing(null);
          }}
        />
      )}
    </div>
  );
}
