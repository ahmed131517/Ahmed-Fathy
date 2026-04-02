import { db, auth, collection, doc, setDoc, getDocs, query, where, onSnapshot, serverTimestamp, deleteDoc, handleFirestoreError, OperationType } from './firebase';

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
    if (!auth.currentUser) throw new Error("User must be authenticated to save knowledge.");
    
    const path = 'saved_knowledge';
    try {
      const newDocRef = doc(collection(db, path));
      const knowledge: SavedKnowledge = {
        userId: auth.currentUser.uid,
        type,
        title,
        data,
        tags: [],
        notes: '',
        createdAt: serverTimestamp()
      };
      await setDoc(newDocRef, knowledge);
      return newDocRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateKnowledge(id: string, updates: Partial<Pick<SavedKnowledge, 'tags' | 'notes'>>) {
    const path = `saved_knowledge/${id}`;
    try {
      const docRef = doc(db, 'saved_knowledge', id);
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteKnowledge(id: string) {
    const path = `saved_knowledge/${id}`;
    try {
      await deleteDoc(doc(db, 'saved_knowledge', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToSavedKnowledge(callback: (knowledge: SavedKnowledge[]) => void) {
    if (!auth.currentUser) return () => {};

    const path = 'saved_knowledge';
    const q = query(collection(db, path), where("userId", "==", auth.currentUser.uid));
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedKnowledge[];
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
