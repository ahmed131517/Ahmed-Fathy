import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

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
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasRole: (role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => boolean;
}

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
  bio: "Dr. Sarah Ahmed is a board-certified General Practitioner with over 12 years of experience in providing comprehensive medical care to patients of all ages. She is dedicated to preventive medicine and patient education, ensuring that her patients are well-informed about their health and treatment options."
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...updates };
      // Update initials if name changes
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const first = newProfile.firstName.charAt(0).toUpperCase();
        const last = newProfile.lastName.charAt(0).toUpperCase();
        newProfile.avatarInitials = `${first}${last}`;
      }
      localStorage.setItem('user_profile', JSON.stringify(newProfile));
      return newProfile;
    });
  }, []);

  const hasRole = useCallback((role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin') => {
    if (profile.role === 'admin') return true;
    return profile.role === role;
  }, [profile.role]);

  const contextValue = useMemo(() => ({ profile, updateProfile, hasRole }), [profile, updateProfile, hasRole]);

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
