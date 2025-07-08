const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

const DEMO_USER_IDS = [
  'teacher001',
  'hod001',
  'principal001',
  'director001',
  'registrar001',
  'hr001',
];

const COLLECTIONS = ['leaveRequests', 'attendance', 'notifications'];

async function deleteDemoUserData() {
  for (const collectionName of COLLECTIONS) {
    const collectionRef = db.collection(collectionName);
    for (const userId of DEMO_USER_IDS) {
      const querySnapshot = await collectionRef.where('userId', '==', userId).get();
      if (querySnapshot.empty) {
        console.log(`[${collectionName}] No documents found for userId: ${userId}`);
        continue;
      }
      const batch = db.batch();
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`[${collectionName}] Deleted ${querySnapshot.size} documents for userId: ${userId}`);
    }
  }
  console.log('✅ All demo user data deleted (except user accounts).');
}

deleteDemoUserData().catch(err => {
  console.error('Error deleting demo user data:', err);
  process.exit(1);
}); 