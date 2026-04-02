import React, { useState, useMemo } from "react";
import { Clock, Package, Eye, GripVertical, User, AlertCircle } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { db, Prescription, PrescriptionItem, PatientRecord } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

interface Order {
  id: string;
  patient: string;
  status: "Pending" | "Ready" | "Completed";
  time: string;
  items: number;
  total: number;
  rawPrescription: Prescription;
  patientData?: PatientRecord;
}

interface SortableItemProps {
  order: Order;
}

const SortableItem: React.FC<SortableItemProps> = ({ order }) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{order.id}</span>
        <GripVertical className="w-4 h-4 text-slate-300" />
      </div>
      <h3 className="font-bold text-slate-900 text-sm mb-1">{order.patient}</h3>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
        <span className="font-semibold text-slate-700">${order.total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export function PharmacyOrders() {
  const dbPrescriptions = useLiveQuery(() => db.prescriptions.toArray()) || [];
  const dbPatients = useLiveQuery(() => db.patients.toArray()) || [];
  const dbItems = useLiveQuery(() => db.prescription_items.toArray()) || [];
  const inventory = useLiveQuery(() => db.pharmacy_inventory.toArray()) || [];

  const orders = useMemo(() => {
    return dbPrescriptions.map(p => {
      const patient = dbPatients.find(pat => pat.id === p.patientId);
      const items = dbItems.filter(i => i.prescriptionId === p.id);
      
      // Calculate total price based on inventory
      let total = 0;
      items.forEach(item => {
        const invItem = inventory.find(i => i.medicationName?.toLowerCase() === item.medicationName?.toLowerCase());
        if (invItem) {
          total += invItem.price;
        } else {
          total += 10; // Default price if not in inventory
        }
      });

      return {
        id: p.id || `local-${p.localId}`,
        patient: patient?.name || "Unknown Patient",
        status: (p.status as any) || "Pending",
        time: new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: items.length,
        total: total,
        rawPrescription: p,
        patientData: patient
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
      try {
        const timestamp = Date.now();
        const prescription = activeOrder.rawPrescription;
        
        // Update prescription status
        if (prescription.localId) {
          await db.prescriptions.update(prescription.localId, {
            status: overContainer,
            lastModified: timestamp
          });

          // If moving to Completed, deduct from inventory
          if (overContainer === "Completed") {
            const items = dbItems.filter(i => i.prescriptionId === prescription.id);
            for (const item of items) {
              const invItem = inventory.find(i => i.medicationName?.toLowerCase() === item.medicationName?.toLowerCase());
              if (invItem && invItem.localId) {
                const newStock = Math.max(0, invItem.stock - 1); // Assuming 1 unit per prescription item for simplicity
                await db.pharmacy_inventory.update(invItem.localId, {
                  stock: newStock,
                  lastModified: timestamp
                });
                
                if (newStock === 0) {
                  toast.warning(`${invItem.medicationName} is now out of stock!`);
                } else if (newStock <= invItem.minStock) {
                  toast.warning(`${invItem.medicationName} is low on stock (${newStock} left)`);
                }
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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Order Management</h2>
        <div className="flex gap-2 text-sm text-slate-500">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pending</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ready</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Completed</span>
        </div>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => (
            <div key={status} className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <div className={`p-3 border-b border-slate-200 font-semibold flex justify-between items-center ${
                status === "Pending" ? "bg-amber-50 text-amber-700" :
                status === "Ready" ? "bg-emerald-50 text-emerald-700" :
                "bg-indigo-50 text-indigo-700"
              }`}>
                {status}
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
                  {columns[status].length}
                </span>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto">
                <SortableContext 
                  id={status}
                  items={columns[status].map(o => o.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-[100px]">
                    {columns[status].map((order) => (
                      <SortableItem key={order.id} order={order} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-xl rotate-2 cursor-grabbing">
              {(() => {
                const order = orders.find(o => o.id === activeId);
                if (!order) return null;
                return (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{order.id}</span>
                      <GripVertical className="w-4 h-4 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{order.patient}</h3>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
                      <span className="font-semibold text-slate-700">${order.total.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
