import { User, Mail, Phone, MapPin, Award, Briefcase, Camera, Save, Shield, Clock, FileText, CheckCircle2 } from "lucide-react";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../lib/UserContext";

export function Profile() {
  const { profile, updateProfile } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState(profile);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'avatarImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);
    
    // Simulate API call
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your personal and professional information</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover & Avatar Section */}
        <div 
          className="h-40 relative bg-cover bg-center border-b border-slate-200 dark:border-slate-800"
          style={{ 
            backgroundImage: formData.coverImage 
              ? `url(${formData.coverImage})` 
              : 'linear-gradient(to right, #6366f1, #9333ea)' 
          }}
        >
          <input 
            type="file" 
            ref={coverInputRef} 
            onChange={(e) => handleImageChange(e, 'coverImage')} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-lg backdrop-blur-sm transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Change Cover
          </button>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-8">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={(e) => handleImageChange(e, 'avatarImage')} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="h-32 w-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border-4 border-white dark:border-slate-900 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-4xl shadow-md overflow-hidden bg-cover bg-center"
                   style={formData.avatarImage ? { backgroundImage: `url(${formData.avatarImage})` } : {}}>
                {!formData.avatarImage && profile.avatarInitials}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
          </div>
          
          <form className="space-y-10" onSubmit={handleSave}>
            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200">
                    <option value="female" className="dark:bg-slate-900">Female</option>
                    <option value="male" className="dark:bg-slate-900">Male</option>
                    <option value="other" className="dark:bg-slate-900">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Professional Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Professional Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialty</label>
                  <input type="text" name="specialty" value={formData.specialty} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical License Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Years of Experience</label>
                  <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Education / Degree</label>
                  <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Contact Information */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Clinic Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-slate-200">
                    <option value="us" className="dark:bg-slate-900">United States</option>
                    <option value="uk" className="dark:bg-slate-900">United Kingdom</option>
                    <option value="ca" className="dark:bg-slate-900">Canada</option>
                    <option value="au" className="dark:bg-slate-900">Australia</option>
                  </select>
                </div>
              </div>
            </section>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Biography */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Biography & Notes</h2>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">About Me</label>
                <textarea 
                  rows={5} 
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y text-slate-900 dark:text-slate-200"
                ></textarea>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-right">Brief description for your public profile. Maximum 500 characters.</p>
              </div>
            </section>
          </form>
        </div>
      </div>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
