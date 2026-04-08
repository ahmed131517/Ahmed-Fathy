import { useState } from "react";
import { X } from "lucide-react";

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  content: string;
  onSave: (newContent: string) => void;
}

export function EditTemplateModal({ isOpen, onClose, templateName, content, onSave }: EditTemplateModalProps) {
  const [value, setValue] = useState(content);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Edit {templateName}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-40 p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={() => { onSave(value); onClose(); }} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
}
