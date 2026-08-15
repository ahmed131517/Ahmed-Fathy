import React, { useState } from "react";
import { MapPin, Plus, Trash2, Edit3, Eye, ShieldAlert, Check, Layers, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export interface BodyPin {
  id: string;
  view: "anterior" | "posterior";
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: "Lesion" | "Surgical Scar" | "Point Tenderness" | "Wound / Ulcer" | "Edema / Swelling" | "Rash" | "Mass / Nodule";
  region: string;
  severity: "Mild" | "Moderate" | "Severe";
  notes: string;
  dateAdded: string;
}

interface AnatomicalBodyMapProps {
  pins: BodyPin[];
  onPinsChange: (pins: BodyPin[]) => void;
  onSummaryGenerate?: (summary: string) => void;
}

export function AnatomicalBodyMap({ pins = [], onPinsChange, onSummaryGenerate }: AnatomicalBodyMapProps) {
  const [activeView, setActiveView] = useState<"anterior" | "posterior">("anterior");
  const [selectedPin, setSelectedPin] = useState<BodyPin | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ x: number; y: number } | null>(null);

  // Form state for new pin
  const [pinType, setPinType] = useState<BodyPin["type"]>("Point Tenderness");
  const [pinRegion, setPinRegion] = useState("Anterior Chest");
  const [pinSeverity, setPinSeverity] = useState<BodyPin["severity"]>("Moderate");
  const [pinNotes, setPinNotes] = useState("");

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setTempCoords({ x, y });

    // Infer region from Y coordinate
    let inferredRegion = activeView === "anterior" ? "Abdomen" : "Lower Back";
    if (y < 20) inferredRegion = activeView === "anterior" ? "Head & Neck" : "Occiput & Neck";
    else if (y < 45) inferredRegion = activeView === "anterior" ? "Anterior Chest / Upper Thorax" : "Upper Back / Scapula";
    else if (y < 65) inferredRegion = activeView === "anterior" ? "Abdomen / Pelvis" : "Lumbar / Gluteal";
    else inferredRegion = activeView === "anterior" ? "Lower Extremity (Leg / Knee)" : "Posterior Leg / Calf";

    setPinRegion(inferredRegion);
    setPinNotes("");
    setIsAddDialogOpen(true);
  };

  const handleSavePin = () => {
    if (!tempCoords) return;

    const newPin: BodyPin = {
      id: `pin_${Date.now()}`,
      view: activeView,
      x: tempCoords.x,
      y: tempCoords.y,
      type: pinType,
      region: pinRegion,
      severity: pinSeverity,
      notes: pinNotes,
      dateAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...pins, newPin];
    onPinsChange(updated);
    setIsAddDialogOpen(false);
    setTempCoords(null);
    toast.success("Anatomical Pin Added", {
      description: `${pinType} logged at ${pinRegion}.`
    });

    generateAndSendSummary(updated);
  };

  const handleDeletePin = (pinId: string) => {
    const updated = pins.filter((p) => p.id !== pinId);
    onPinsChange(updated);
    if (selectedPin?.id === pinId) setSelectedPin(null);
    toast.info("Pin removed");
    generateAndSendSummary(updated);
  };

  const generateAndSendSummary = (currentPins: BodyPin[]) => {
    if (currentPins.length === 0) return;
    const summaryText = currentPins
      .map((p, idx) => `${idx + 1}. [${p.view.toUpperCase()}] ${p.region} - ${p.type} (${p.severity}): ${p.notes || "No extra notes"}`)
      .join("\n");

    if (onSummaryGenerate) {
      onSummaryGenerate(summaryText);
    }
  };

  const activePins = pins.filter((p) => p.view === activeView);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Interactive Body Map Annotator
          </h3>
          <p className="text-xs text-slate-500">
            Click on the anatomical canvas to place interactive lesion, tenderness, scar, or wound markers
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveView("anterior")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === "anterior" ? "bg-white text-indigo-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Anterior View
            </button>
            <button
              type="button"
              onClick={() => setActiveView("posterior")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeView === "posterior" ? "bg-white text-indigo-700 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Posterior View
            </button>
          </div>

          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold px-2.5 py-1">
            {pins.length} Pin{pins.length === 1 ? "" : "s"} Placed
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Canvas Stage (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            onClick={handleMapClick}
            className="relative w-full max-w-[340px] h-[480px] bg-gradient-to-b from-slate-50 to-indigo-50/20 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 cursor-crosshair transition-all shadow-inner overflow-hidden group select-none"
          >
            {/* Background Anatomical SVG Vector Illustration */}
            <svg viewBox="0 0 200 400" className="w-full h-full text-slate-300 fill-slate-100 stroke-slate-400 stroke-[1.5]">
              {activeView === "anterior" ? (
                <g>
                  {/* Head */}
                  <circle cx="100" cy="35" r="22" />
                  {/* Neck */}
                  <rect x="92" y="57" width="16" height="12" rx="2" />
                  {/* Torso */}
                  <path d="M 60,70 Q 100,65 140,70 L 132,180 Q 100,185 68,180 Z" />
                  {/* Arms */}
                  <path d="M 58,72 L 35,150 Q 30,180 25,200 L 38,202 L 64,110 Z" />
                  <path d="M 142,72 L 165,150 Q 170,180 175,200 L 162,202 L 136,110 Z" />
                  {/* Legs */}
                  <path d="M 68,180 L 62,290 L 58,370 L 82,370 L 92,280 L 95,182 Z" />
                  <path d="M 132,180 L 138,290 L 142,370 L 118,370 L 108,280 L 105,182 Z" />
                  {/* Chest / Rib Accents */}
                  <line x1="80" y1="100" x2="120" y2="100" className="stroke-slate-300 stroke-1" />
                  <line x1="75" y1="120" x2="125" y2="120" className="stroke-slate-300 stroke-1" />
                  <line x1="72" y1="140" x2="128" y2="140" className="stroke-slate-300 stroke-1" />
                  <circle cx="100" cy="155" r="2" className="fill-slate-400" /> {/* Umbilicus */}
                </g>
              ) : (
                <g>
                  {/* Head Posterior */}
                  <circle cx="100" cy="35" r="22" />
                  {/* Neck / Spine line */}
                  <line x1="100" y1="57" x2="100" y2="180" className="stroke-indigo-300 stroke-2 stroke-dasharray-[3,3]" />
                  {/* Torso Posterior */}
                  <path d="M 60,70 Q 100,65 140,70 L 132,180 Q 100,185 68,180 Z" />
                  {/* Scapulae */}
                  <path d="M 70,85 Q 85,90 85,110 Q 70,115 70,85 Z" className="fill-slate-200 stroke-slate-300" />
                  <path d="M 130,85 Q 115,90 115,110 Q 130,115 130,85 Z" className="fill-slate-200 stroke-slate-300" />
                  {/* Arms */}
                  <path d="M 58,72 L 35,150 Q 30,180 25,200 L 38,202 L 64,110 Z" />
                  <path d="M 142,72 L 165,150 Q 170,180 175,200 L 162,202 L 136,110 Z" />
                  {/* Gluteal & Legs */}
                  <path d="M 68,180 L 62,290 L 58,370 L 82,370 L 92,280 L 95,182 Z" />
                  <path d="M 132,180 L 138,290 L 142,370 L 118,370 L 108,280 L 105,182 Z" />
                </g>
              )}
            </svg>

            {/* Click Indicator Overlay Prompt */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click anywhere to drop pin
            </div>

            {/* Render Active Pins */}
            {activePins.map((pin) => {
              const isSelected = selectedPin?.id === pin.id;
              return (
                <div
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10 ${
                    isSelected ? "scale-125 z-20" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white ${
                      pin.severity === "Severe"
                        ? "bg-red-600 animate-pulse"
                        : pin.severity === "Moderate"
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                    }`}
                  >
                    <MapPin className="w-4 h-4 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pins List & Detail Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Annotated Findings List ({pins.length})</span>
            {pins.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onPinsChange([]);
                  setSelectedPin(null);
                  toast.info("All body pins cleared");
                }}
                className="text-xs text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </h4>

          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {pins.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No body map annotations added yet.</p>
                <p className="text-[11px] text-slate-400">Click anywhere on the body diagram to pinpoint lesions, wounds, or tender regions.</p>
              </div>
            ) : (
              pins.map((pin, idx) => {
                const isSelected = selectedPin?.id === pin.id;
                return (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedPin(pin)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-300 shadow-sm"
                        : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900">{pin.type}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600 bg-white">
                          {pin.view}
                        </Badge>
                      </div>
                      <Badge
                        className={
                          pin.severity === "Severe"
                            ? "bg-red-100 text-red-700 border-red-200 text-[10px]"
                            : pin.severity === "Moderate"
                            ? "bg-amber-100 text-amber-700 border-amber-200 text-[10px]"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]"
                        }
                      >
                        {pin.severity}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-slate-700">{pin.region}</p>

                    {pin.notes && <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-md border border-slate-100">{pin.notes}</p>}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                      <span>Logged at {pin.dateAdded}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePin(pin.id);
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Dialog for Adding New Pin */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-700">
              <MapPin className="w-5 h-5" /> Add Body Map Annotation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Finding / Lesion Type</Label>
              <Select value={pinType} onValueChange={(v: any) => setPinType(v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Point Tenderness">Point Tenderness</SelectItem>
                  <SelectItem value="Lesion">Skin Lesion / Rash</SelectItem>
                  <SelectItem value="Surgical Scar">Surgical Scar</SelectItem>
                  <SelectItem value="Wound / Ulcer">Wound / Pressure Ulcer</SelectItem>
                  <SelectItem value="Edema / Swelling">Edema / Swelling</SelectItem>
                  <SelectItem value="Mass / Nodule">Mass / Nodule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Anatomical Region Name</Label>
              <Input value={pinRegion} onChange={(e) => setPinRegion(e.target.value)} className="h-9" placeholder="e.g. RUQ Abdomen, Right Knee Joint" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Severity / Grade</Label>
              <div className="flex gap-2">
                {(["Mild", "Moderate", "Severe"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setPinSeverity(sev)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      pinSeverity === sev ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Clinical Description / Notes</Label>
              <Textarea
                value={pinNotes}
                onChange={(e) => setPinNotes(e.target.value)}
                placeholder="e.g., 3x2 cm well-healed scar without erythema or induration..."
                className="h-20 resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSavePin} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
