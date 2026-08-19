'use client';

import { useState, useEffect } from 'react';
import { 
  AppSurface, 
  PageHeader, 
  GlassCard, 
  PrimaryButton, 
  SecondaryButton, 
  DangerButton, 
  Skeleton,
  Pill,
  QRCodePlaceholder
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { safetyPassService } from '@/services/safetyPassService';
import { SafetyPass } from '@/types';
import { safetyPassSchema, SafetyPassFormData } from '@/features/tourist/SafetyPassSchema';
import { Shield, Droplet, Phone, AlertCircle, EyeOff, QrCode, X } from 'lucide-react';

type ViewMode = 'loading' | 'view' | 'edit' | 'create';

export default function TouristSafety() {
  const { user } = useAuth();
  
  const [mode, setMode] = useState<ViewMode>('loading');
  const [pass, setPass] = useState<SafetyPass | null>(null);
  
  const [formData, setFormData] = useState<Partial<SafetyPassFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const loadSafetyPass = async () => {
      try {
        if (!user?.uid) return;
        const data = await safetyPassService.getSafetyPass(user.uid);
        if (data && data.isActive) {
          setPass(data);
          setMode('view');
        } else {
          // Pre-fill form if deactivated or new
          setFormData(prev => ({
            ...prev,
            name: data?.name || user.name || '',
            phone: data?.phone || '',
            emergencyContact: data?.emergencyContact || '',
            bloodGroup: (data?.bloodGroup as SafetyPassFormData['bloodGroup']) || 'Unknown',
            medicalNote: data?.medicalNote || '',
          }));
          setMode('create');
        }
      } catch (err) {
        console.error('Failed to load safety pass', err);
        setMode('create'); // fallback
      }
    };

    if (user?.uid) {
      loadSafetyPass();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    // Validate
    const validation = safetyPassSchema.safeParse(formData);
    
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) {
          formattedErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await safetyPassService.saveSafetyPass(user.uid, validation.data);
      setPass(saved);
      setMode('view');
    } catch (err) {
      console.error('Failed to save safety pass', err);
      alert('Failed to save Safety Pass. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user?.uid) return;
    const confirm = window.confirm('Are you sure you want to deactivate your Safety Pass? Your information will be hidden from responders.');
    if (!confirm) return;

    setIsSubmitting(true);
    try {
      await safetyPassService.deactivateSafetyPass(user.uid);
      setPass(null);
      setMode('create');
    } catch (err) {
      console.error('Failed to deactivate', err);
      alert('Failed to deactivate Safety Pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: LOADING
  // ---------------------------------------------------------------------------
  if (mode === 'loading') {
    return (
      <div className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full">
        <PageHeader title="Safety Pass" subtitle="Loading your medical profile..." />
        <Skeleton className="h-96 w-full rounded-3xl mt-8" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: VIEW
  // ---------------------------------------------------------------------------
  if (mode === 'view' && pass) {
    const expiry = new Date(pass.expiryDate).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });

    return (
      <div className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full relative">
        <PageHeader 
          title="Safety Pass" 
          subtitle="Your verified medical and emergency profile." 
        />
        
        <GlassCard className="mt-8 p-6 lg:p-10 relative overflow-hidden bg-gradient-to-br from-white to-sand-light/50 border border-sand shadow-lg">
          
          {/* Top Row: Identifier & Privacy */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Shield size={24} className="text-taupe-dark" />
                <span className="font-mono font-bold text-taupe-dark tracking-widest text-lg">
                  TRI-{pass.uid.substring(0, 6).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-taupe">Active until {expiry}</span>
            </div>
            <Pill className="bg-success/10 text-success border-success/20">
              <EyeOff size={14} className="mr-1 inline" /> Ghost Mode
            </Pill>
          </div>

          <p className="text-sm text-taupe font-medium mb-8 bg-white/50 p-3 rounded-xl inline-block border border-white">
            <Shield size={16} className="inline mr-2 text-[#4A90E2]" />
            Your full journey is not continuously exposed to responders. Only accessed during incidents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-bold text-taupe uppercase tracking-wider mb-1">Name</h3>
              <p className="text-xl font-bold text-taupe-dark">{pass.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-taupe uppercase tracking-wider mb-1 flex items-center gap-2">
                <Droplet size={14} className="text-alert" /> Blood Group
              </h3>
              <p className="text-xl font-bold text-taupe-dark">{pass.bloodGroup}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-taupe uppercase tracking-wider mb-1 flex items-center gap-2">
                <Phone size={14} /> Emergency Contact
              </h3>
              <p className="text-lg font-semibold text-taupe-dark">{pass.emergencyContact}</p>
            </div>
            {pass.medicalNote && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-taupe uppercase tracking-wider mb-1 flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#F5A623]" /> Critical Medical Note
                </h3>
                <p className="text-md font-medium text-taupe-dark bg-alert/5 p-4 rounded-xl border border-alert/10">
                  {pass.medicalNote}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-12 pt-6 border-t border-sand">
            <PrimaryButton onClick={() => setShowQR(true)}>
              <QrCode size={18} className="mr-2 inline" /> Show QR
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => {
              setFormData({
                name: pass.name,
                phone: pass.phone,
                emergencyContact: pass.emergencyContact,
                bloodGroup: pass.bloodGroup as SafetyPassFormData['bloodGroup'],
                medicalNote: pass.medicalNote
              });
              setMode('edit');
            }}>
              Edit
            </SecondaryButton>
            <div className="flex-1"></div>
            <DangerButton onClick={handleDeactivate} disabled={isSubmitting}>
              Deactivate
            </DangerButton>
          </div>
        </GlassCard>

        {/* QR Code Modal Overlay */}
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-taupe-dark/80 backdrop-blur-sm">
            <div className="bg-ivory-warm p-8 rounded-3xl shadow-2xl relative max-w-sm w-full flex flex-col items-center">
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 text-taupe hover:text-taupe-dark transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="font-bold text-taupe-dark mb-6 text-xl">Verification QR</h3>
              <QRCodePlaceholder identifier={pass.uid} />
              <p className="text-center text-taupe text-sm mt-6 font-medium leading-relaxed">
                Present this to verified TRINETRA responders to securely transmit your emergency profile offline.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: CREATE / EDIT FORM
  // ---------------------------------------------------------------------------
  return (
    <div className="flex-1 p-6 lg:p-12 max-w-3xl mx-auto w-full">
      <PageHeader 
        title={mode === 'create' ? "Create Safety Pass" : "Edit Safety Pass"} 
        subtitle="This information could save your life. Keep it accurate." 
      />
      
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <AppSurface className="p-6 md:p-8 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-taupe-dark">Full Name *</label>
            <input 
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className={`p-3 rounded-xl border ${errors.name ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
              placeholder="e.g. Jane Doe"
            />
            {errors.name && <span className="text-alert text-sm font-medium">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-taupe-dark">Personal Phone *</label>
              <input 
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className={`p-3 rounded-xl border ${errors.phone ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
                placeholder="+1 555-0192"
              />
              {errors.phone && <span className="text-alert text-sm font-medium">{errors.phone}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-taupe-dark">Emergency Contact *</label>
              <input 
                name="emergencyContact"
                value={formData.emergencyContact || ''}
                onChange={handleInputChange}
                className={`p-3 rounded-xl border ${errors.emergencyContact ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
                placeholder="+1 555-0193 (Mom)"
              />
              {errors.emergencyContact && <span className="text-alert text-sm font-medium">{errors.emergencyContact}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-taupe-dark">Blood Group *</label>
            <select 
              name="bloodGroup"
              value={formData.bloodGroup || 'Unknown'}
              onChange={handleInputChange}
              className={`p-3 rounded-xl border ${errors.bloodGroup ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.bloodGroup && <span className="text-alert text-sm font-medium">{errors.bloodGroup}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-taupe-dark">Critical Medical Note <span className="text-taupe font-normal">(Optional)</span></label>
            <textarea 
              name="medicalNote"
              value={formData.medicalNote || ''}
              onChange={handleInputChange}
              rows={3}
              className={`p-3 rounded-xl border ${errors.medicalNote ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
              placeholder="e.g. Severe peanut allergy. Carries EpiPen."
            />
            {errors.medicalNote && <span className="text-alert text-sm font-medium">{errors.medicalNote}</span>}
          </div>

        </AppSurface>

        <div className="flex gap-4">
          <PrimaryButton type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Generate Safety Pass' : 'Save Changes'}
          </PrimaryButton>
          {mode === 'edit' && (
            <SecondaryButton type="button" onClick={() => setMode('view')} disabled={isSubmitting}>
              Cancel
            </SecondaryButton>
          )}
        </div>
      </form>
    </div>
  );
}
