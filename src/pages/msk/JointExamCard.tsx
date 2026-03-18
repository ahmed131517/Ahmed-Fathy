import React from 'react';
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { JointExam } from "../PhysicalExam"; // Assuming we'll export it from PhysicalExam or a common types file

interface JointExamCardProps {
  exam: JointExam;
  specialTests: string[];
  onRemove: () => void;
  onUpdate: (id: number, field: keyof JointExam, value: any) => void;
  onToggleSpecialTest: (examId: number, test: string) => void;
}

export function JointExamCard({ exam, specialTests, onRemove, onUpdate, onToggleSpecialTest }: JointExamCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
          {exam.joint} Examination
        </h4>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Range of Motion (ROM)</Label>
              <Select value={exam.rom} onValueChange={(v) => onUpdate(exam.id, 'rom', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="painful">Painful</SelectItem>
                  <SelectItem value="limited-painful">Limited & Painful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stability</Label>
              <Select value={exam.stability} onValueChange={(v) => onUpdate(exam.id, 'stability', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="laxity">Laxity</SelectItem>
                  <SelectItem value="unstable">Unstable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Inspection & Palpation</Label>
            <div className="flex flex-wrap gap-2">
              {['Swelling', 'Erythema', 'Deformity', 'Tenderness', 'Crepitus', 'Effusion'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded bg-slate-50 border border-slate-200 hover:border-primary transition-colors">
                  <Checkbox 
                    checked={exam.inspection.includes(opt) || exam.palpation.includes(opt)}
                    onCheckedChange={(checked) => {
                      const field = ['Swelling', 'Erythema', 'Deformity'].includes(opt) ? 'inspection' : 'palpation';
                      const current = exam[field] as string[];
                      const next = checked 
                        ? [...current, opt]
                        : current.filter(o => o !== opt);
                      onUpdate(exam.id, field, next);
                    }}
                  />
                  <span className="text-xs text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Special Tests</Label>
            <div className="grid grid-cols-2 gap-2">
              {specialTests.map(test => (
                <label key={test} className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded bg-slate-50 border border-slate-200 hover:border-primary transition-colors">
                  <Checkbox 
                    checked={exam.specialTestResults.includes(test)}
                    onCheckedChange={() => onToggleSpecialTest(exam.id, test)}
                  />
                  <span className="text-[10px] text-slate-700 leading-tight">{test}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Specific Findings</Label>
            <Textarea 
              className="min-h-[60px] text-xs"
              placeholder="Enter specific findings..."
              value={exam.notes}
              onChange={(e) => onUpdate(exam.id, 'notes', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
