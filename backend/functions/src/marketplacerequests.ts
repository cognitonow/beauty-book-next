import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod';

admin.initializeApp();
const db = admin.firestore();

const submitMarketplaceRequestSchema = z.object({
  lookerId: z.string(),
  serviceName: z.string(),
  area: z.string(),
  notes: z.string().optional(),
  notificationOptIn: z.boolean(),
});

const updateMarketplaceRequestStatusSchema = z.object({
    status: z.enum(['pending', 'matched', 'cancelled', 'fulfilled']),
});

export const submitMarketplaceRequest = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
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

    const requestData = req.body;

    // Authorization: Ensure authenticated user is the looker in the request
    if (authenticatedUserId !== requestData.lookerId) {
        res.status(403).json({ error: 'Forbidden: Cannot submit request for another user' });
        return;
    }

    // Fetch user document to check role
    const userDoc = await db.collection('users').doc(authenticatedUserId).get();
     if (!userDoc.exists || userDoc.data()?.role !== 'Looker') {
         res.status(403).json({ error: 'Forbidden: Only Lookers can submit marketplace requests' });
         return;
     }


    // Implement data validation using Zod
    const validationResult = submitMarketplaceRequestSchema.safeParse(requestData);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Use .issues instead of .errors
      });
      return;
    }

    const validatedData = validationResult.data;

    // Save the new marketplace request document to Firestore
    const newMarketplaceRequestData = {
        ...validatedData,
        lookerId: authenticatedUserId,
        status: 'pending',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('marketplaceRequests').add(newMarketplaceRequestData);


    res.status(201).json({
        message: 'Marketplace request submitted',
        requestId: docRef.id,
    });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error submitting marketplace request:', error);
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

export const getMarketplaceRequests = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
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

    // Fetch user document to check role
    const userDoc = await db.collection('users').doc(authenticatedUserId).get();
     if (!userDoc.exists || (userDoc.data()?.role !== 'Provider' && userDoc.data()?.role !== 'Admin')) {
         res.status(403).json({ error: 'Forbidden: Only Providers and Admins can view marketplace requests' });
         return;
     }


    // Extract optional query parameters
    const { status, area } = req.query;

    let requestsRef: admin.firestore.CollectionReference | admin.firestore.Query = db.collection('marketplaceRequests');

    // Build query based on parameters
    if (status) {
      requestsRef = requestsRef.where('status', '==', status as string); // Cast status to string
    }
    if (area) {
        requestsRef = requestsRef.where('area', '==', area as string); // Cast area to string
    }

    // TODO: Consider ordering the results (e.g., by timestamp)


    const snapshot = await requestsRef.get();

    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    res.status(200).json(requests);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting marketplace requests:', error);
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

export const updateMarketplaceRequestStatus = functions.https.onRequest(async (req, res) => {
  // Allow only PUT requests
  if (req.method !== 'PUT') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const requestId = req.url.split('/').pop(); // Extract request ID from URL

  if (!requestId) {
    res.status(400).json({ error: 'Request ID is required' });
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

    // Fetch user document to check role
    const userDoc = await db.collection('users').doc(authenticatedUserId).get();
     if (!userDoc.exists || (userDoc.data()?.role !== 'Provider' && userDoc.data()?.role !== 'Admin')) {
         res.status(403).json({ error: 'Forbidden: Only Providers and Admins can update marketplace request status' });
         return;
     }


    const requestData = req.body;

    // Implement data validation using Zod
    const validationResult = updateMarketplaceRequestStatusSchema.safeParse(requestData);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Use .issues instead of .errors
      });
      return;
    }

    const validatedData = validationResult.data;


    // Get a reference to the marketplace request document
    const requestRef = db.collection('marketplaceRequests').doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      res.status(404).json({ error: 'Marketplace request not found' });
      return;
    }


    // Update the 'status' field and 'updatedAt' timestamp
    await requestRef.update({
        status: validatedData.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // TODO: If status becomes 'matched', potentially set matchedProviderId to authenticatedUserId
    });


    res.status(200).json({ message: 'Marketplace request status updated' });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error updating marketplace request status:', error);
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
