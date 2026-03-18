import React from 'react';
import { cn } from "@/lib/utils";

interface JointBodyMapProps {
  selectedJoint: string;
  onJointClick: (joint: string) => void;
  examinedJoints: string[];
}

export function JointBodyMap({ selectedJoint, onJointClick, examinedJoints }: JointBodyMapProps) {
  const joints = [
    { id: 'Shoulder (L)', label: 'L Shoulder', x: '30%', y: '20%' },
    { id: 'Shoulder (R)', label: 'R Shoulder', x: '70%', y: '20%' },
    { id: 'Elbow (L)', label: 'L Elbow', x: '25%', y: '35%' },
    { id: 'Elbow (R)', label: 'R Elbow', x: '75%', y: '35%' },
    { id: 'Wrist (L)', label: 'L Wrist', x: '20%', y: '50%' },
    { id: 'Wrist (R)', label: 'R Wrist', x: '80%', y: '50%' },
    { id: 'Hip (L)', label: 'L Hip', x: '40%', y: '55%' },
    { id: 'Hip (R)', label: 'R Hip', x: '60%', y: '55%' },
    { id: 'Knee (L)', label: 'L Knee', x: '40%', y: '75%' },
    { id: 'Knee (R)', label: 'R Knee', x: '60%', y: '75%' },
    { id: 'Ankle (L)', label: 'L Ankle', x: '40%', y: '90%' },
    { id: 'Ankle (R)', label: 'R Ankle', x: '60%', y: '90%' },
    { id: 'Cervical Spine', label: 'Cervical', x: '50%', y: '15%' },
    { id: 'Lumbar Spine', label: 'Lumbar', x: '50%', y: '45%' },
  ];

  return (
    <div className="relative w-64 h-96 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <path d="M100,20 L120,40 L120,80 L140,100 L140,180 L120,200 L120,380 L80,380 L80,200 L60,180 L60,100 L80,80 L80,40 Z" fill="currentColor" />
        </svg>
      </div>
      {joints.map((joint) => (
        <button
          key={joint.id}
          onClick={() => onJointClick(joint.id)}
          className={cn(
            "absolute w-4 h-4 rounded-full border-2 transition-all -translate-x-1/2 -translate-y-1/2 group",
            selectedJoint === joint.id 
              ? "bg-primary border-white scale-125 z-10 shadow-lg" 
              : examinedJoints.includes(joint.id)
                ? "bg-emerald-500 border-white"
                : "bg-white border-slate-400 hover:border-primary hover:scale-110"
          )}
          style={{ left: joint.x, top: joint.y }}
          title={joint.label}
        >
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20">
            {joint.label}
          </span>
        </button>
      ))}
    </div>
  );
}
