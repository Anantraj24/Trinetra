import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const seedDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Seed can only be run in development environment.');
    return;
  }

  try {
    console.log('Seeding data...');
    // Seed hazards (Example)
    const hazardsRef = collection(db, 'hazards');
    
    const demoHazards = [
      {
        type: 'Flash Flood Warning',
        severity: 0.9,
        location: { lat: 28.7041, lng: 77.1025 },
        description: 'Severe flash flooding detected along the primary river crossing. Verified by local meteorological department.',
        active: true,
        trustLevel: 'VERIFIED',
        source: 'Meteorological Department',
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        type: 'Landslide Debris',
        severity: 0.75,
        location: { lat: 28.7141, lng: 77.1125 },
        description: 'Minor landslide debris partially blocking the valley route. Reported by local rangers.',
        active: true,
        trustLevel: 'ESTABLISHED',
        source: 'Forest Rangers',
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        type: 'Bridge Sensor Anomaly',
        severity: 0.5,
        location: { lat: 28.7241, lng: 77.1225 },
        description: 'Automated structural sensors indicate abnormal vibration on the suspension bridge.',
        active: true,
        trustLevel: 'AUTOMATED',
        source: 'Sensor Network Alpha',
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        type: 'Unusual Traffic Pattern',
        severity: 0.3,
        location: { lat: 28.7341, lng: 77.1325 },
        description: 'Multiple users have deviated from the primary path in this area. Possible unmapped obstacle.',
        active: true,
        trustLevel: 'INFERRED',
        source: 'Telemetry Analysis',
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        type: 'Wildlife Sighting',
        severity: 0.6,
        location: { lat: 28.7441, lng: 77.1425 },
        description: 'A single tourist reported aggressive wildlife near the checkpoint.',
        active: true,
        trustLevel: 'UNVERIFIED',
        source: 'User Report',
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      }
    ];

    for (const hazard of demoHazards) {
      await addDoc(hazardsRef, hazard);
    }
    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

export const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Clear can only be run in development environment.');
    return;
  }
  
  // Note: Clearing collections from client SDK is generally not recommended
  // because you have to fetch all documents and delete them one by one.
  // This is a minimal helper for the demo prototype if needed.
  try {
    console.log('Clearing hazards...');
    const hazardsRef = collection(db, 'hazards');
    const snapshot = await getDocs(hazardsRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'hazards', d.id)));
    await Promise.all(deletePromises);
    console.log('Clear complete.');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
