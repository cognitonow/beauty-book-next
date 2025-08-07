import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const getUserAchievements = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const userId = req.url.split('/').pop(); // Extract user ID from URL

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    // Authorization: Compare authenticated user ID with userId in URL
    if (authenticatedUserId !== userId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to view other users\' achievements' });
        return;
    }

    // Retrieve achievement documents from Firestore filtered by userId
    const achievementsRef = db.collection('achievements').where('userId', '==', authenticatedUserId);

    const snapshot = await achievementsRef.get();

    const achievements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(achievements);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting user achievements:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return;
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export const getAllBadges = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    // Retrieve all badge definition documents from a 'badgeDefinitions' collection
    const badgeDefinitionsRef = db.collection('badgeDefinitions');
    const snapshot = await badgeDefinitionsRef.get();

    const badgeDefinitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(badgeDefinitions);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting all badges:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Type guard
        // Handle specific errors if needed, e.g., database permission errors
     }
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});
