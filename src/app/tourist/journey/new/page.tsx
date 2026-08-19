'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AppSurface, 
  PageHeader, 
  GlassCard, 
  PrimaryButton, 
  JourneyMap,
  StatusPill
} from '@/components/ui';
import { Shield, MapPin, Clock, Navigation, Download, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { journeyService } from '@/services/journeyService';
import { idbService } from '@/services/idbService';
import { safetyPassService } from '@/services/safetyPassService';
import { journeyContractSchema, JourneyContractFormData } from '@/features/tourist/JourneySchema';
import { JourneyStatus, GeoLocation } from '@/types/journey';

const DEMO_LOCATIONS: Record<string, GeoLocation> = {
  'base_camp_a': { lat: 34.0522, lng: -118.2437, name: 'Base Camp Alpha' },
  'ridge_checkpoint': { lat: 34.1522, lng: -118.1437, name: 'Ridge Checkpoint' },
  'valley_outpost': { lat: 34.2522, lng: -118.0437, name: 'Valley Outpost' },
};

export default function NewJourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Partial<JourneyContractFormData>>({
    checkInIntervalMinutes: 60,
    safeCorridorRadiusMeters: 500,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPackDownloaded, setIsPackDownloaded] = useState(false);
  const [hasSafetyPass, setHasSafetyPass] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [journeyId, setJourneyId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has safety pass
    if (user?.uid) {
      safetyPassService.getSafetyPass(user.uid).then(pass => {
        if (pass && pass.isActive) setHasSafetyPass(true);
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'origin' || name === 'destination') {
      const loc = DEMO_LOCATIONS[value];
      if (loc) {
        setFormData(prev => ({ ...prev, [name]: loc }));
      } else {
        const newForm = { ...formData };
        delete newForm[name as keyof JourneyContractFormData];
        setFormData(newForm);
      }
    } else if (name === 'checkInIntervalMinutes' || name === 'safeCorridorRadiusMeters') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateContract = async () => {
    if (!user?.uid) return;
    
    const validation = journeyContractSchema.safeParse(formData);
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
      const journey = await journeyService.createDraftJourney(user.uid, validation.data);
      setJourneyId(journey.id);
      // Also cache in IDB as draft for prototype convenience (though technically it's a draft)
      await idbService.saveActiveJourney(journey);
    } catch (err) {
      console.error(err);
      alert('Failed to create journey contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPack = async () => {
    if (!journeyId) return;
    
    setIsDownloading(true);
    // Simulate network delay for prototype
    setTimeout(async () => {
      await idbService.saveSafetyPack(journeyId, {
        region: 'Prototype Region',
        offlineMapTiles: true,
        hazards: ['Rockfall area at km 4', 'Washed out bridge'],
        emergencyContacts: ['+15550000', '+15550001']
      });
      setIsDownloading(false);
      setIsPackDownloaded(true);
    }, 1500);
  };

  const handleStartJourney = async () => {
    if (!journeyId || !hasSafetyPass || !isPackDownloaded) return;
    
    setIsSubmitting(true);
    try {
      await journeyService.updateJourneyStatus(journeyId, JourneyStatus.ACTIVE);
      const j = await idbService.getActiveJourney(journeyId);
      if (j) {
        j.status = JourneyStatus.ACTIVE;
        await idbService.saveActiveJourney(j);
      }
      
      router.push('/tourist/journey');
    } catch (err) {
      console.error(err);
      alert('Failed to start journey.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto w-full relative pb-32 lg:pb-12">
      
      <button onClick={() => router.back()} className="flex items-center gap-2 text-taupe font-bold mb-6 hover:text-taupe-dark transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <PageHeader 
        title="Journey Safety Contract" 
        subtitle="Establish your intended route. TRINETRA will watch your back." 
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6">
          <AppSurface className="p-6 md:p-8 flex flex-col gap-6 shadow-sm border border-sand">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-taupe-dark flex items-center gap-2">
                <MapPin size={16} className="text-[#4A90E2]" /> Origin
              </label>
              <select 
                name="origin" 
                onChange={handleInputChange} 
                className={`p-3 rounded-xl border ${errors.origin ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
              >
                <option value="">Select Origin...</option>
                {Object.entries(DEMO_LOCATIONS).map(([key, loc]) => (
                  <option key={key} value={key}>{loc.name}</option>
                ))}
              </select>
              {errors.origin && <span className="text-alert text-sm font-medium">{errors.origin}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-taupe-dark flex items-center gap-2">
                <MapPin size={16} className="text-[#2E5B8F]" /> Destination
              </label>
              <select 
                name="destination" 
                onChange={handleInputChange} 
                className={`p-3 rounded-xl border ${errors.destination ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark focus:outline-none focus:ring-2 focus:ring-taupe`}
              >
                <option value="">Select Destination...</option>
                {Object.entries(DEMO_LOCATIONS).map(([key, loc]) => (
                  <option key={key} value={key}>{loc.name}</option>
                ))}
              </select>
              {errors.destination && <span className="text-alert text-sm font-medium">{errors.destination}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-taupe-dark flex items-center gap-2">
                  <Clock size={16} className="text-taupe" /> Start Time
                </label>
                <input 
                  type="datetime-local" 
                  name="startTime" 
                  onChange={handleInputChange}
                  className={`p-3 rounded-xl border ${errors.startTime ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark`}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-taupe-dark flex items-center gap-2">
                  <Clock size={16} className="text-taupe" /> Expected Return
                </label>
                <input 
                  type="datetime-local" 
                  name="expectedReturnTime" 
                  onChange={handleInputChange}
                  className={`p-3 rounded-xl border ${errors.expectedReturnTime ? 'border-alert' : 'border-sand'} bg-white text-taupe-dark`}
                />
              </div>
            </div>
            {(errors.startTime || errors.expectedReturnTime) && (
              <span className="text-alert text-sm font-medium">{errors.startTime || errors.expectedReturnTime}</span>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-taupe-dark">Check-in Interval (mins)</label>
                <select 
                  name="checkInIntervalMinutes" 
                  value={formData.checkInIntervalMinutes}
                  onChange={handleInputChange}
                  className="p-3 rounded-xl border border-sand bg-white text-taupe-dark"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={120}>2 Hours</option>
                  <option value={240}>4 Hours</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-taupe-dark flex items-center gap-2">
                  <Navigation size={16} className="text-success" /> Corridor Radius (m)
                </label>
                <select 
                  name="safeCorridorRadiusMeters" 
                  value={formData.safeCorridorRadiusMeters}
                  onChange={handleInputChange}
                  className="p-3 rounded-xl border border-sand bg-white text-taupe-dark"
                >
                  <option value={100}>100m (Strict)</option>
                  <option value={500}>500m (Standard)</option>
                  <option value={2000}>2km (Wide)</option>
                </select>
              </div>
            </div>

            {!journeyId && (
              <PrimaryButton onClick={handleCreateContract} disabled={isSubmitting} className="mt-4">
                {isSubmitting ? 'Validating...' : 'Create Journey Contract'}
              </PrimaryButton>
            )}

          </AppSurface>

          {/* Context Info Card */}
          <div className="bg-ivory-warm p-6 rounded-3xl border border-sand-light shadow-sm flex gap-4 items-start">
            <Info size={24} className="text-[#4A90E2] flex-shrink-0 mt-1" />
            <p className="text-sm font-medium text-taupe-dark leading-relaxed">
              TRINETRA compares the expected journey with your observed device location. 
              If you leave the Safe Corridor radius without checking in, or miss a scheduled check-in, 
              responders are alerted with this contract context.
            </p>
          </div>
        </div>

        {/* Right Column: Visuals & Actions */}
        <div className="flex flex-col gap-6">
          <JourneyMap className="h-64 lg:h-auto lg:flex-1" />

          {journeyId && (
            <GlassCard className="p-6 bg-gradient-to-br from-white to-[#FAFAFA] border border-success/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-taupe-dark">Regional Safety Pack</h3>
                {isPackDownloaded ? (
                  <StatusPill status="success" label="Ready" />
                ) : (
                  <StatusPill status="alert" label="Required" />
                )}
              </div>
              
              <div className="space-y-3 text-sm font-medium text-taupe mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={isPackDownloaded ? "text-success" : "text-sand"} />
                  <span className={isPackDownloaded ? "text-taupe-dark" : ""}>Offline route map & topography</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={isPackDownloaded ? "text-success" : "text-sand"} />
                  <span className={isPackDownloaded ? "text-taupe-dark" : ""}>Known hazard coordinates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={isPackDownloaded ? "text-success" : "text-sand"} />
                  <span className={isPackDownloaded ? "text-taupe-dark" : ""}>Safe checkpoint data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className={isPackDownloaded ? "text-success" : "text-sand"} />
                  <span className={isPackDownloaded ? "text-taupe-dark" : ""}>Emergency contact cache</span>
                </div>
              </div>

              {!isPackDownloaded ? (
                <PrimaryButton onClick={handleDownloadPack} disabled={isDownloading} className="w-full">
                  <Download size={18} className="mr-2 inline" /> 
                  {isDownloading ? 'Downloading to Device...' : 'Download Safety Pack'}
                </PrimaryButton>
              ) : (
                <div className="flex flex-col gap-4">
                  {!hasSafetyPass && (
                    <div className="bg-alert/10 text-alert p-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-alert/20">
                      <Shield size={16} /> Active Safety Pass required to start.
                    </div>
                  )}
                  <PrimaryButton 
                    onClick={handleStartJourney} 
                    disabled={isSubmitting || !hasSafetyPass}
                    className="w-full bg-[#4A90E2] hover:bg-[#3A80D2]"
                  >
                    {isSubmitting ? 'Starting...' : 'Start Journey'}
                  </PrimaryButton>
                </div>
              )}
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}
