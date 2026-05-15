import { supabase, supabaseEnabled } from './supabase';

export interface SavedKnowledge {
  id?: string;
  userId: string;
  type: 'drug' | 'protocol' | 'lab' | 'encyclopedia';
  title: string;
  data: any;
  tags?: string[];
  notes?: string;
  createdAt: any;
}

export const SavedKnowledgeService = {
  async saveKnowledge(type: SavedKnowledge['type'], title: string, data: any) {
    if (!supabaseEnabled) {
      console.info("Saved knowledge disabled: Supabase not configured");
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User must be authenticated to save knowledge.");
    
    const { data: result, error } = await supabase
      .from('saved_knowledge')
      .insert({
        user_id: user.id,
        type,
        title,
        data,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (saveKnowledge):', error);
      return null;
    }
    return result.id;
  },

  async updateKnowledge(id: string, updates: Partial<Pick<SavedKnowledge, 'tags' | 'notes'>>) {
    if (!supabaseEnabled) return;

    const { error } = await supabase
      .from('saved_knowledge')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (updateKnowledge):', error);
    }
  },

  async deleteKnowledge(id: string) {
    if (!supabaseEnabled) return;

    const { error } = await supabase
      .from('saved_knowledge')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (deleteKnowledge):', error);
    }
  },

  subscribeToSavedKnowledge(callback: (knowledge: SavedKnowledge[]) => void) {
    if (!supabaseEnabled) return () => {};

    let unsubscribe = () => {};

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Initial fetch
      const { data } = await supabase
        .from('saved_knowledge')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) callback(data as any);

      // Subscribe to changes
      const channel = supabase
        .channel('saved_knowledge_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'saved_knowledge', filter: `user_id=eq.${user.id}` },
          async () => {
            const { data: updated } = await supabase
              .from('saved_knowledge')
              .select('*')
              .eq('user_id', user.id);
            if (updated) callback(updated as any);
          }
        )
        .subscribe();

      unsubscribe = () => {
        supabase.removeChannel(channel);
      };
    };

    setup();
    return () => unsubscribe();
  }
};
