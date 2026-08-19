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
    await addDoc(hazardsRef, {
      type: 'WEATHER',
      severity: 'HIGH',
      location: { lat: 28.7041, lng: 77.1025 },
      description: 'Heavy rainfall expected.',
      active: true,
      trustLevel: 'VERIFIED',
    });
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
