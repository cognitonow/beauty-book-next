import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod'; // Assuming Zod is used for validation

admin.initializeApp();
const db = admin.firestore();

// Define Zod schema for updating user (assuming a schema like this exists)
// You might need to adjust this schema based on your actual user data structure
const updateUserSchema = z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
    // Add other updatable user fields here
});

// Define Zod schema for adding/removing favorite provider
const favoriteProviderSchema = z.object({
    providerId: z.string(),
});


export const updateUser = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only PUT requests
  if ((req as any).method !== 'PUT') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const userId = (req as any).url.split('/').pop(); // Used type assertion

  if (!userId) {
    (res as any).status(400).json({ error: 'User ID is required' }); // Used type assertion
    return;
  }

  try {
    // Implement authentication
    const authHeader = (req as any).headers.authorization; // Used type assertion
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    // Authorization: Ensure authenticated user is the user being updated or is an admin
    // TODO: Implement admin role check if needed
    if (authenticatedUserId !== userId) {
        (res as any).status(403).json({ error: 'Forbidden: Insufficient permissions' }); // Used type assertion
        return;
    }

    const userData = (req as any).body; // Used type assertion

    // Implement data validation using Zod
    const validationResult = updateUserSchema.safeParse(userData);

    if (!validationResult.success) {
      (res as any).status(400).json({ // Used type assertion
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Corrected to .issues
      });
      return;
    }

    const validatedData = validationResult.data;

    // Get a reference to the user document
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      (res as any).status(404).json({ error: 'User not found' }); // Used type assertion
      return;
    }

    // Update the user document with validated data and updated timestamp
    await userRef.update({
        ...validatedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    (res as any).status(200).json({ message: 'User updated successfully' }); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error updating user:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            (res as any).status(401).json({ error: 'Unauthorized: Invalid or expired token' }); // Used type assertion
            return;
        }
     }
    (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
    return;
  }
});

export const deleteUser = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only DELETE requests
  if ((req as any).method !== 'DELETE') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const userId = (req as any).url.split('/').pop(); // Used type assertion

  if (!userId) {
    (res as any).status(400).json({ error: 'User ID is required' }); // Used type assertion
    return;
  }

  try {
    // Implement authentication
    const authHeader = (req as any).headers.authorization; // Used type assertion
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    // Authorization: Ensure authenticated user is the user being deleted or is an admin
    // TODO: Implement admin role check if needed
    if (authenticatedUserId !== userId) {
        (res as any).status(403).json({ error: 'Forbidden: Insufficient permissions' }); // Used type assertion
        return;
    }

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    (res as any).status(200).json({ message: 'User deleted successfully' }); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error deleting user:', error);
    // Handle specific Firebase Auth errors
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked' || error.code === 'auth/user-not-found') {
            (res as any).status(401).json({ error: 'Unauthorized: Invalid or expired token' }); // Used type assertion
            return;
        }
     }
    (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
    return;
  }
});


export const addFavoriteProvider = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
    // Allow only POST requests
    if ((req as any).method !== 'POST') { // Used type assertion
        (res as any).status(405).send('Method Not Allowed'); // Used type assertion
        return;
    }

    const userId = (req as any).url.split('/').pop(); // Used type assertion

    if (!userId) {
        (res as any).status(400).json({ error: 'User ID is required' }); // Used type assertion
        return;
    }

    try {
        // Implement authentication
        const authHeader = (req as any).headers.authorization; // Used type assertion
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const authenticatedUserId = decodedToken.uid;

        // Authorization: Ensure authenticated user is the user updating favorites
        if (authenticatedUserId !== userId) {
            (res as any).status(403).json({ error: 'Forbidden: Cannot update favorites for another user' }); // Used type assertion
            return;
        }

        const requestData = (req as any).body; // Used type assertion

        // Implement data validation using Zod
        const validationResult = favoriteProviderSchema.safeParse(requestData);

        if (!validationResult.success) {
            (res as any).status(400).json({ // Used type assertion
                error: 'Invalid data provided',
                details: validationResult.error.issues, // Corrected to .issues
            });
            return;
        }

        const validatedData = validationResult.data;

        // Get a reference to the user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            (res as any).status(404).json({ error: 'User not found' }); // Used type assertion
            return;
        }

        // Get current favorites array (if it exists)
        const currentFavorites = userDoc.data()?.favoriteProviders || [];

        // Check if provider is already in favorites
        if (currentFavorites.includes(validatedData.providerId)) {
            (res as any).status(409).json({ error: 'Provider is already in favorites' }); // Used type assertion
            return;
        }

        // Add the provider to the favorites array
        const updatedFavorites = [...currentFavorites, validatedData.providerId];

        // Update the user document with the new favorites array
        await userRef.update({
            favoriteProviders: updatedFavorites,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        (res as any).status(200).json({ message: 'Provider added to favorites' }); // Used type assertion
        return;

    } catch (error: unknown) { // Added type annotation
        console.error('Error adding favorite provider:', error);
         if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
             if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
                (res as any).status(401).json({ error: 'Unauthorized: Invalid or expired token' }); // Used type assertion
                return;
            }
         }
        (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
        return;
    }
});


export const removeFavoriteProvider = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
    // Allow only DELETE requests (or PUT with a body indicating removal)
    // Using DELETE with providerId in body for consistency with addFavoriteProvider schema
    if ((req as any).method !== 'DELETE') { // Used type assertion
        (res as any).status(405).send('Method Not Allowed'); // Used type assertion
        return;
    }

    const userId = (req as any).url.split('/').pop(); // Used type assertion

    if (!userId) {
        (res as any).status(400).json({ error: 'User ID is required' }); // Used type assertion
        return;
    }

    try {
        // Implement authentication
        const authHeader = (req as any).headers.authorization; // Used type assertion
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const authenticatedUserId = decodedToken.uid;

        // Authorization: Ensure authenticated user is the user updating favorites
        if (authenticatedUserId !== userId) {
            (res as any).status(403).json({ error: 'Forbidden: Cannot update favorites for another user' }); // Used type assertion
            return;
        }

        const requestData = (req as any).body; // Used type assertion

        // Implement data validation using Zod
        const validationResult = favoriteProviderSchema.safeParse(requestData);

        if (!validationResult.success) {
            (res as any).status(400).json({ // Used type assertion
                error: 'Invalid data provided',
                details: validationResult.error.issues, // Corrected to .issues
            });
            return;
        }

        const validatedData = validationResult.data;


        // Get a reference to the user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            (res as any).status(404).json({ error: 'User not found' }); // Used type assertion
            return;
        }

        // Get current favorites array
        const currentFavorites: string[] = userDoc.data()?.favoriteProviders || [];

        // Check if provider is in favorites
        if (!currentFavorites.includes(validatedData.providerId)) {
            (res as any).status(404).json({ error: 'Provider not found in favorites' }); // Used type assertion
            return;
        }

        // Remove the provider from the favorites array
        const updatedFavorites = currentFavorites.filter(
            (providerId: string) => providerId !== validatedData.providerId
        );

        // Update the user document with the new favorites array
        await userRef.update({
            favoriteProviders: updatedFavorites,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        (res as any).status(200).json({ message: 'Provider removed from favorites' }); // Used type assertion
        return;

    } catch (error: unknown) { // Added type annotation
        console.error('Error removing favorite provider:', error);
         if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
             if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
                (res as any).status(401).json({ error: 'Unauthorized: Invalid or expired token' }); // Used type assertion
                return;
            }
         }
        (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
        return;
    }
});


export const searchUsers = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only GET requests
  if ((req as any).method !== 'GET') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const keyword = (req as any).query.keyword as string; // Used type assertion and casting

  try {
    // TODO: Implement search logic using the 'keyword' to filter users from Firestore
    // You might search by name, email, or other relevant fields.
    // Consider case-insensitivity and partial matching if needed.
    // Example: const usersRef = db.collection('users').orderBy('name').startAt(keyword).endAt(keyword + '\uf8ff');
    // For more complex search (e.g., multiple fields, case-insensitive partial match),
    // you might need to use a dedicated search service like Algolia or a combination of queries.

    // For now, returning an empty array as a placeholder
    const searchResults: any[] = []; // Explicitly type the search results array
    (res as any).status(200).json(searchResults); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error searching users:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
        // Handle specific errors if needed
     }
    (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
    return;
  }
});
