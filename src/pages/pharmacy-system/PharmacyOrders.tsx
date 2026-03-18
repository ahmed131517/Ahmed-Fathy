import React, { useState } from "react";
import { Clock, Package, Eye, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Order {
  id: string;
  patient: string;
  status: "Pending" | "Ready" | "Completed";
  time: string;
  items: number;
  total: number;
}

const initialOrders: Order[] = [
  { id: "ORD-12345", patient: "John Smith", status: "Pending", time: "10:30 AM", items: 3, total: 45.00 },
  { id: "ORD-12346", patient: "Emily Davis", status: "Ready", time: "09:15 AM", items: 2, total: 32.50 },
  { id: "ORD-12347", patient: "Michael Brown", status: "Completed", time: "Yesterday", items: 1, total: 15.00 },
  { id: "ORD-12348", patient: "Sarah Wilson", status: "Pending", time: "08:45 AM", items: 4, total: 68.20 },
  { id: "ORD-12349", patient: "David Lee", status: "Ready", time: "11:00 AM", items: 1, total: 12.00 },
];

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
  const [orders, setOrders] = useState<Order[]>(initialOrders);
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the container (column) of the active item
    const activeContainer = orders.find(o => o.id === activeId)?.status;
    
    // Find the container (column) of the over item (or if over is a container itself)
    let overContainer = orders.find(o => o.id === overId)?.status;
    
    // If dropping on a container directly (empty column or column header area)
    if (["Pending", "Ready", "Completed"].includes(overId)) {
      overContainer = overId as "Pending" | "Ready" | "Completed";
    }

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      setOrders((prev) => {
        return prev.map(order => 
          order.id === activeId ? { ...order, status: overContainer as any } : order
        );
      });
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
