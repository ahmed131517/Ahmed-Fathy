import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { User, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db as firestoreDb } from './firebase';

export interface ClinicMember {
  id: string;
  name: string;
  address?: string;
  inviteCode: string;
  role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin';
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin';
  specialty: string;
  avatarInitials: string;
  dob: string;
  gender: string;
  licenseNumber: string;
  experience: number;
  education: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  bio: string;
  coverImage?: string;
  avatarImage?: string;
  clinicId: string;
  clinicName: string;
  joinedClinics?: ClinicMember[];
}

interface UserContextType {
  profile: UserProfile;
  firebaseUser: User | null;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasRole: (role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => boolean;
  switchClinic: (clinicId: string, clinicName: string) => void;
  createClinic: (name: string, address?: string) => Promise<string>;
  joinClinic: (inviteCode: string) => Promise<boolean>;
  updateClinicRole: (clinicId: string, role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => void;
  loginWithProfile: (clinicId: string, clinicName: string, name: string, email: string, role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => void;
}

export const defaultJoinedClinics: ClinicMember[] = [
  { id: "clinic_a", name: "Clinic A (Downtown)", inviteCode: "DEMO-A", address: "123 Medical Center Blvd", role: "doctor" },
  { id: "clinic_b", name: "Clinic B (Northside)", inviteCode: "DEMO-B", address: "456 Healthcare Avenue", role: "nurse" }
];

const defaultProfile: UserProfile = {
  firstName: "Sarah",
  lastName: "Ahmed",
  email: "sarah.ahmed@clinic.com",
  role: "doctor",
  specialty: "General Practitioner",
  avatarInitials: "SA",
  dob: "1985-06-15",
  gender: "female",
  licenseNumber: "MD-8475920",
  experience: 12,
  education: "MD, Harvard Medical School",
  phone: "+1 (555) 123-4567",
  address: "123 Medical Center Blvd, Suite 400",
  city: "San Francisco",
  country: "us",
  bio: "Dr. Sarah Ahmed is a board-certified General Practitioner with over 12 years of experience in providing comprehensive medical care to patients of all ages. She is dedicated to preventive medicine and patient education, ensuring that her patients are well-informed about their health and treatment options.",
  clinicId: "clinic_a",
  clinicName: "Clinic A (Downtown)",
  joinedClinics: defaultJoinedClinics
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => {
    const savedMock = localStorage.getItem('mock_user_session');
    if (savedMock) {
      try {
        return JSON.parse(savedMock);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure defaults are set if missing in older profiles
      return {
        ...defaultProfile,
        ...parsed,
        clinicId: parsed.clinicId || "clinic_a",
        clinicName: parsed.clinicName || "Clinic A (Downtown)",
        joinedClinics: parsed.joinedClinics || defaultJoinedClinics
      };
    }
    return defaultProfile;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Check if we are running as an isolated mock profile session
      const savedMock = localStorage.getItem('mock_user_session');
      if (savedMock && !user) {
        setLoadingAuth(false);
        return;
      }

      setFirebaseUser(user);
      if (user) {
        try {
          const docRef = doc(firestoreDb, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const loadedProfile: UserProfile = {
              ...defaultProfile,
              ...data,
              firstName: data.firstName || prevLastNameOrDisplayName(user, true),
              lastName: data.lastName || prevLastNameOrDisplayName(user, false),
              email: user.email || data.email || defaultProfile.email,
              clinicId: data.clinicId || 'clinic_a',
              clinicName: data.clinicName || 'Clinic A (Downtown)',
              joinedClinics: data.joinedClinics || defaultJoinedClinics
            };
            setProfile(loadedProfile);
            localStorage.setItem('user_profile', JSON.stringify(loadedProfile));
          } else {
            const firstName = prevLastNameOrDisplayName(user, true);
            const lastName = prevLastNameOrDisplayName(user, false);
            const savedRole = localStorage.getItem('pre_selected_role') || 'doctor';
            const mappedRole: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin' = 
              (savedRole === 'admin' || savedRole === 'pharmacist' || savedRole === 'doctor' || savedRole === 'nurse' || savedRole === 'receptionist')
                ? savedRole
                : 'doctor';

            const newProfile: UserProfile = {
              ...defaultProfile,
              firstName,
              lastName,
              role: mappedRole,
              specialty: mappedRole === 'pharmacist' ? 'Clinical Pharmacist' : mappedRole === 'admin' ? 'System Administrator' : 'General Practitioner',
              email: user.email || defaultProfile.email,
              avatarInitials: `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`,
              clinicId: "clinic_a",
              clinicName: "Clinic A (Downtown)",
              joinedClinics: defaultJoinedClinics
            };
            await setDoc(docRef, {
              uid: user.uid,
              firstName: newProfile.firstName,
              lastName: newProfile.lastName,
              email: newProfile.email,
              role: newProfile.role,
              specialty: newProfile.specialty,
              clinicId: newProfile.clinicId,
              clinicName: newProfile.clinicName,
              joinedClinics: newProfile.joinedClinics,
              createdAt: new Date().toISOString()
            });
            setProfile(newProfile);
            localStorage.setItem('user_profile', JSON.stringify(newProfile));
          }
        } catch (e) {
          console.warn('Error fetching user profile from Firestore: ', e);
        }
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  function prevLastNameOrDisplayName(user: User, getFirst: boolean) {
    const nameParts = (user.displayName || "Sarah Ahmed").split(" ");
    if (getFirst) return nameParts[0] || "Sarah";
    return nameParts.slice(1).join(" ") || "Ahmed";
  }

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const first = newProfile.firstName.charAt(0).toUpperCase();
        const last = newProfile.lastName.charAt(0).toUpperCase();
        newProfile.avatarInitials = `${first}${last}`;
      }
      localStorage.setItem('user_profile', JSON.stringify(newProfile));

      if (auth.currentUser) {
        const docRef = doc(firestoreDb, 'users', auth.currentUser.uid);
        setDoc(docRef, {
          uid: auth.currentUser.uid,
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          email: newProfile.email,
          role: newProfile.role,
          specialty: newProfile.specialty,
          phone: newProfile.phone,
          address: newProfile.address,
          city: newProfile.city,
          country: newProfile.country,
          bio: newProfile.bio,
          clinicId: newProfile.clinicId,
          clinicName: newProfile.clinicName,
          joinedClinics: newProfile.joinedClinics || null,
          avatarImage: newProfile.avatarImage || null,
          coverImage: newProfile.coverImage || null
        }, { merge: true }).catch(err => {
          console.warn('Failed to update user profile in Firestore: ', err);
        });
      }

      return newProfile;
    });
  }, []);

  const createClinic = useCallback(async (name: string, address?: string) => {
    if (!auth.currentUser) {
      toast.error("Please sign in first to establish a workspace.");
      throw new Error("unauthenticated");
    }
    try {
      const clinicId = `clinic_${Math.random().toString(36).substring(2, 11)}`;
      const rawCode = `CLIN-${Math.random().toString(36).substring(2, 5).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`;
      const inviteCode = rawCode.replace(/O|0|I|1/g, 'X');

      const newClinic: ClinicMember = {
        id: clinicId,
        name,
        address: address || '',
        inviteCode,
        role: 'admin' // Creator becomes Admin of the workspace
      };

      const clinicDocRef = doc(firestoreDb, 'clinics', clinicId);
      await setDoc(clinicDocRef, {
        ...newClinic,
        ownerUid: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      const currentJoined = profile.joinedClinics || defaultJoinedClinics;
      const updatedJoined = [...currentJoined, newClinic];

      updateProfile({
        clinicId,
        clinicName: name,
        role: 'admin',
        joinedClinics: updatedJoined
      });

      window.dispatchEvent(new CustomEvent('clinic_changed', { detail: { clinicId, clinicName: name, role: 'admin' } }));
      toast.success(`Success! Workspace "${name}" established with ADMIN permissions.`);
      return clinicId;
    } catch (err: any) {
      toast.error(`Error establishing workspace: ${err.message || String(err)}`);
      throw err;
    }
  }, [profile, updateProfile]);

  const joinClinic = useCallback(async (code: string) => {
    if (!auth.currentUser) {
      toast.error("Please sign in first to establish or join a workspace.");
      return false;
    }
    const sanitizedCode = code.trim().toUpperCase();
    if (!sanitizedCode) {
      toast.error("Please enter a valid invitation code.");
      return false;
    }

    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(firestoreDb, 'clinics'), where('inviteCode', '==', sanitizedCode));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        toast.error("Clinic with this invitation code was not found. Please verify with your lead doctor.");
        return false;
      }

      const matchDoc = querySnap.docs[0];
      const data = matchDoc.data();
      const resolvedRole = profile.role || 'doctor';
      const clinicToJoin: ClinicMember = {
        id: matchDoc.id,
        name: data.name,
        address: data.address || '',
        inviteCode: data.inviteCode,
        role: resolvedRole
      };

      const currentJoined = profile.joinedClinics || defaultJoinedClinics;
      const alreadyJoined = currentJoined.some(c => c.id === clinicToJoin.id);
      
      const updatedJoined = alreadyJoined 
        ? currentJoined 
        : [...currentJoined, clinicToJoin];

      updateProfile({
        clinicId: clinicToJoin.id,
        clinicName: clinicToJoin.name,
        role: resolvedRole,
        joinedClinics: updatedJoined
      });

      window.dispatchEvent(new CustomEvent('clinic_changed', { detail: { clinicId: clinicToJoin.id, clinicName: clinicToJoin.name, role: resolvedRole } }));
      toast.success(`Welcome to ${clinicToJoin.name}! Successfully synced clinical workspace with role: ${resolvedRole.toUpperCase()}.`);
      return true;
    } catch (err: any) {
      toast.error(`Could not join workspace: ${err.message || String(err)}`);
      return false;
    }
  }, [profile, updateProfile]);

  const loginWithGoogle = useCallback(async () => {
    try {
      localStorage.removeItem('mock_user_session');
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in successfully via Google SSO");
    } catch (err: any) {
      toast.error(`Authentication: ${err.message || String(err)}`);
    }
  }, []);

  const loginWithProfile = useCallback((
    clinicId: string, 
    clinicName: string, 
    name: string, 
    email: string, 
    role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin'
  ) => {
    const mockUser = {
      uid: `mock_${clinicId}_${role}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: name,
      email: email,
      isAnonymous: false,
      photoURL: null,
      providerId: 'custom_mtenant',
    } as any;

    const firstName = name.split(" ")[0] || "Sarah";
    const lastName = name.split(" ").slice(1).join(" ") || "Ahmed";

    const customProfile: UserProfile = {
      ...defaultProfile,
      firstName,
      lastName,
      email,
      role,
      specialty: role === 'pharmacist' ? 'Clinical Pharmacist' : role === 'admin' ? 'System Administrator' : role === 'nurse' ? 'Clinical Nurse' : role === 'receptionist' ? 'Medical Receptionist' : 'General Practitioner',
      avatarInitials: `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`,
      clinicId,
      clinicName,
      joinedClinics: profile.joinedClinics || defaultJoinedClinics
    };

    setFirebaseUser(mockUser);
    setProfile(customProfile);

    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    localStorage.setItem('user_profile', JSON.stringify(customProfile));

    window.dispatchEvent(new CustomEvent('clinic_changed', { detail: { clinicId, clinicName, role } }));
    toast.success(`Welcome back ${name}! Authenticated into ${clinicName} with role: ${role.toUpperCase()}`);
  }, [profile]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('mock_user_session');
      localStorage.removeItem('user_profile');
      await auth.signOut();
      setFirebaseUser(null);
      toast.success("Signed out successfully");
    } catch (err: any) {
      toast.error(`Sign out error: ${err.message || String(err)}`);
    }
  }, []);

  const switchClinic = useCallback((clinicId: string, clinicName: string) => {
    const clinics = profile.joinedClinics || defaultJoinedClinics;
    const match = clinics.find(c => c.id === clinicId);
    const resolvedRole = match?.role || 'doctor';

    updateProfile({ clinicId, clinicName, role: resolvedRole });
    window.dispatchEvent(new CustomEvent('clinic_changed', { detail: { clinicId, clinicName, role: resolvedRole } }));
    toast.success(`Switched to ${clinicName} (${resolvedRole.toUpperCase()})`);
  }, [profile, updateProfile]);

  const updateClinicRole = useCallback((clinicId: string, role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => {
    const clinics = profile.joinedClinics || defaultJoinedClinics;
    const updatedClinics = clinics.map(c => c.id === clinicId ? { ...c, role } : c);

    if (profile.clinicId === clinicId) {
      updateProfile({
        joinedClinics: updatedClinics,
        role: role
      });
      window.dispatchEvent(new CustomEvent('clinic_changed', { detail: { clinicId, clinicName: profile.clinicName, role } }));
      toast.success(`Active workspace role successfully changed to ${role.toUpperCase()}`);
    } else {
      updateProfile({
        joinedClinics: updatedClinics
      });
      toast.success(`Role for ${clinics.find(c => c.id === clinicId)?.name} set to ${role.toUpperCase()}`);
    }
  }, [profile, updateProfile]);

  const hasRole = useCallback((role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => {
    if (profile.role === 'admin') return true;
    return profile.role === role;
  }, [profile.role]);

  const contextValue = useMemo(() => ({ 
    profile, 
    firebaseUser, 
    loadingAuth, 
    loginWithGoogle, 
    logout, 
    updateProfile, 
    hasRole, 
    switchClinic,
    createClinic,
    joinClinic,
    updateClinicRole,
    loginWithProfile
  }), [profile, firebaseUser, loadingAuth, loginWithGoogle, logout, updateProfile, hasRole, switchClinic, createClinic, joinClinic, updateClinicRole, loginWithProfile]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
