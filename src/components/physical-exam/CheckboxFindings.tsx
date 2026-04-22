import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  label: string;
}

interface CheckboxFindingsProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function CheckboxFindings({ label, options, selected = [], onChange }: CheckboxFindingsProps) {
  const handleToggle = (id: string) => {
    if ((selected || []).includes(id)) {
      onChange((selected || []).filter((item) => item !== id));
    } else {
      onChange([...(selected || []), id]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {(options || []).map((option) => (
          <div
            key={option.id}
            onClick={() => handleToggle(option.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
              (selected || []).includes(option.id)
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Checkbox
              id={option.id}
              checked={(selected || []).includes(option.id)}
              onCheckedChange={() => handleToggle(option.id)}
              className="pointer-events-none"
            />
            <span className="text-sm font-medium">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
