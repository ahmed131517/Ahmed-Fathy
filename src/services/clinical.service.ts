import { parseJsonResponse } from "@/utils/gemini";
import { clinicalAIRequest } from "./aiWorkflowService";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

export interface ClinicalInteraction {
  severity: 'Minor' | 'Moderate' | 'Major';
  description: string;
}

export interface SuggestedTask {
  title: string;
  type: 'follow-up' | 'lab-review' | 'outreach' | 'other';
  priority: 'high' | 'medium' | 'low';
}

/**
 * ClinicalService encapsulates shared medical logic and AI-driven CDSS features.
 * This separates business logic from UI components.
 */
export const ClinicalService = {
  /**
   * Scans a treatment plan against existing patient medications for potential DDIs.
   */
  async checkMedicationInteractions(plan: string, existingMedications: any[]): Promise<ClinicalInteraction[]> {
    if (!plan.trim() || !existingMedications?.length) {
      return [];
    }

    const prompt = `Act as a clinical decision support system. Analyze the following patient medications and the proposed plan. 
    Identify ANY potential drug-drug interactions between the patient's existing medications and the new treatments mentioned in the plan.
    
    Patient Existing Medications: ${JSON.stringify(existingMedications)}
    Proposed Treatment Plan:
    ${plan}
    
    Return a JSON array of objects with the following structure:
    [
      {
        "severity": "Minor" | "Moderate" | "Major",
        "description": "Short explanation of the interaction..."
      }
    ]
    If no interactions are found, return exactly []. 
    Only include active interactions.`;

    try {
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }]
      );

      return parseJsonResponse(responseText, []);
    } catch (err) {
      console.error("ClinicalService.checkMedicationInteractions failed:", err);
      return [];
    }
  },

  /**
   * Extracts actionable clinical tasks from a treatment plan.
   */
  async extractTasksFromPlan(plan: string): Promise<SuggestedTask[]> {
    if (!plan.trim()) {
      return [];
    }

    const prompt = `Analyze the following clinical treatment plan and extract actionable tasks for the medical staff. 
    Identify laboratory orders, follow-up scheduling, referrals, or specific patient outreach.
    
    Plan:
    ${plan}
    
    Return a JSON array of objects with the following structure:
    [
      {
        "title": "Short descriptive title",
        "type": "follow-up" | "lab-review" | "outreach" | "other",
        "priority": "high" | "medium" | "low"
      }
    ]
    If no actionable tasks are found, return exactly [].`;

    try {
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }]
      );

      return parseJsonResponse(responseText, []);
    } catch (err) {
      console.error("ClinicalService.extractTasksFromPlan failed:", err);
      return [];
    }
  },

  /**
   * Commits a task to the persistent store (Syncs Dexie and Supabase).
   */
  async commitTask(task: SuggestedTask, patientId: string, patientName: string) {
    const taskData = {
      title: task.title,
      status: 'pending' as const,
      type: task.type,
      priority: task.priority,
      patientId,
      patientName,
      dueDate: new Date().toISOString(),
      createdAt: Date.now(),
      lastModified: Date.now(),
      isDeleted: 0,
      isSynced: 0
    };

    // 1. Local Persistence (Dexie)
    const localId = await db.tasks.add(taskData);

    // 2. Immediate Cloud Sync (Supabase) if online
    try {
      const { error } = await supabase.from('tasks').insert({
        id: `local_${localId}_${Date.now()}`,
        patient_id: patientId,
        patient_name: patientName,
        title: task.title,
        status: 'pending',
        type: task.type,
        priority: task.priority,
        due_date: new Date().toISOString().split('T')[0],
        last_modified: Date.now()
      });

      if (!error) {
        await db.tasks.update(localId, { isSynced: 1 });
      }
    } catch (err) {
      console.warn("ClinicalService: Supabase direct sync failed, relying on background sync engine.", err);
    }

    return localId;
  }
};
