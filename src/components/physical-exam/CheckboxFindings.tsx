import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Info, AlertCircle, CheckCircle2, Search, X } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";

interface Option {
  id: string;
  label: string;
  severity?: 'normal' | 'abnormal' | 'critical';
  description?: string;
}

interface CheckboxFindingsProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  allowSearch?: boolean;
}

export function CheckboxFindings({ label, options, selected = [], onChange, allowSearch = false }: CheckboxFindingsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (id: string) => {
    const isSelected = (selected || []).includes(id);
    if (isSelected) {
      onChange((selected || []).filter((item) => item !== id));
    } else {
      onChange([...(selected || []), id]);
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          {label}
          {selected.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {selected.length}
            </span>
          )}
        </Label>
        
        {allowSearch && options.length > 8 && (
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-7 pl-8 pr-7 text-xs bg-slate-50 border-slate-200"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {(filteredOptions || []).map((option) => {
            const isSelected = (selected || []).includes(option.id);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={option.id}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 relative",
                  isSelected
                    ? "bg-indigo-50/50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200/50 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                )}
              >
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(option.id)}
                  className={cn(
                    "pointer-events-none transition-transform duration-200",
                    isSelected && "scale-110"
                  )}
                />
                
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{option.label}</span>
                  {option.description && isSelected && (
                    <motion.span 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-[10px] text-indigo-500/80 mt-1 leading-tight max-w-[150px]"
                    >
                      {option.description}
                    </motion.span>
                  )}
                </div>

                {option.severity === 'abnormal' && isSelected && (
                  <AlertCircle className="w-3 h-3 text-amber-500 absolute -top-1 -right-1 bg-white rounded-full" />
                )}
                {option.severity === 'critical' && isSelected && (
                  <AlertCircle className="w-3 h-3 text-red-500 absolute -top-1 -right-1 bg-white rounded-full fill-white" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
