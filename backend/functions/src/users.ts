import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { z } from 'zod';

// Define Zod schema for validating user data updates
const UserUpdateSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(), // Defined as optional array of strings
});

admin.initializeApp();
const db = admin.firestore();

export const updateUser = functions.https.onRequest(async (req, res) => {
  // Allow only PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).send('Method Not Allowed');
  }

  const userId = req.url.split('/').pop(); // Extract user ID from URL

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Implement authentication and authorization check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    if (authenticatedUserId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    const userDataToUpdate = req.body;

    // Implement data validation using Zod
    const validationResult = UserUpdateSchema.safeParse(userDataToUpdate);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.errors,
      });
    }

    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.update(userDataToUpdate);

    return res.status(200).json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Error updating user:', error);
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/argument-error') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});
