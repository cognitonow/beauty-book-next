import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as z from 'zod';

const updateUserSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(), // You might want a more specific phone number validation
  address: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(), // Assuming skills are represented by strings (e.g., skill IDs or names)
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

export const deleteUser = functions.https.onRequest(async (req, res) => {
  // Allow only DELETE requests
  if (req.method !== 'DELETE') {
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

  try {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userRef.delete();
 await admin.auth().deleteUser(userId); // Delete user from Firebase Auth
    // TODO: Consider deleting the user from Firebase Authentication: admin.auth().deleteUser(userId);

    return res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
