import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod'; // Assuming Zod is used for validation

admin.initializeApp();
const db = admin.firestore();

// Define Zod schemas for service operations (examples - adjust based on your actual data structures)

const createServiceSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number().positive(),
    duration: z.number().int().positive(), // Duration in minutes, for example
    providerId: z.string(), // The ID of the provider offering this service
    category: z.string(), // Service category (e.g., 'Hair', 'Nails')
    imageUrl: z.string().url().optional(),
    availableDays: z.array(z.string()).optional(), // e.g., ['Monday', 'Wednesday']
    availableTimes: z.array(z.string()).optional(), // e.g., ['09:00', '17:00']
});

const updateServiceSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    duration: z.number().int().positive().optional(),
    category: z.string().optional(),
    imageUrl: z.string().url().optional(),
    availableDays: z.array(z.string()).optional(),
    availableTimes: z.array(z.string()).optional(),
});


export const getServices = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only GET requests
  if ((req as any).method !== 'GET') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  try {
    // Implement authentication and authorization if needed (e.g., only authenticated users can view services)
    // For now, allowing public access to view services

    // Extract optional query parameters for filtering (e.g., by category, provider)
    const { category, providerId } = (req as any).query; // Used type assertion

    let servicesRef: admin.firestore.CollectionReference | admin.firestore.Query = db.collection('services');

    // Build query based on parameters
    if (category) {
      servicesRef = servicesRef.where('category', '==', category as string); // Cast to string
    }
    if (providerId) {
        servicesRef = servicesRef.where('providerId', '==', providerId as string); // Cast to string
    }

    // TODO: Consider ordering the results (e.g., by name, price)

    const snapshot = await servicesRef.get();

    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    (res as any).status(200).json(services); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error getting services:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
        // Handle specific errors if needed
     }
    (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
    return;
  }
});


export const getServiceDetails = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only GET requests
  if ((req as any).method !== 'GET') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const serviceId = (req as any).url.split('/').pop(); // Used type assertion

  if (!serviceId) {
    (res as any).status(400).json({ error: 'Service ID is required' }); // Used type assertion
    return;
  }

  try {
    // Implement authentication and authorization if needed (e.g., only authenticated users)

    const serviceRef = db.collection('services').doc(serviceId);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      (res as any).status(404).json({ error: 'Service not found' }); // Used type assertion
      return;
    }

    const serviceData = serviceDoc.data();

    (res as any).status(200).json({ // Used type assertion
        id: serviceDoc.id,
        ...serviceData,
    });
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error getting service details:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
        // Handle specific errors if needed
     }
    (res as any).status(500).json({ error: 'Internal server error' }); // Used type assertion
    return;
  }
});


export const createService = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only POST requests
  if ((req as any).method !== 'POST') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  try {
    // Implement authentication and authorization (e.g., only Providers can create services)
    const authHeader = (req as any).headers.authorization; // Used type assertion
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const serviceData = (req as any).body; // Used type assertion

    // Authorization: Ensure authenticated user is the provider specified in the request
    // TODO: Implement role check to ensure authenticated user is a Provider
    if (authenticatedUserId !== serviceData.providerId) {
        (res as any).status(403).json({ error: 'Forbidden: Cannot create service for another provider' }); // Used type assertion
        return;
    }

    // Implement data validation using Zod
    const validationResult = createServiceSchema.safeParse(serviceData);

    if (!validationResult.success) {
      (res as any).status(400).json({ // Used type assertion
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Corrected to .issues
      });
      return;
    }

    const validatedData = validationResult.data;

    // Save the new service document to Firestore
    const newServiceData = {
        ...validatedData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('services').add(newServiceData);

    (res as any).status(201).json({ message: 'Service created successfully', serviceId: docRef.id }); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error creating service:', error);
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


export const updateService = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only PUT requests
  if ((req as any).method !== 'PUT') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const serviceId = (req as any).url.split('/').pop(); // Used type assertion

  if (!serviceId) {
    (res as any).status(400).json({ error: 'Service ID is required' }); // Used type assertion
    return;
  }

  try {
    // Implement authentication and authorization (e.g., only the service's provider or Admin can update)
    const authHeader = (req as any).headers.authorization; // Used type assertion
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const serviceRef = db.collection('services').doc(serviceId);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      (res as any).status(404).json({ error: 'Service not found' }); // Used type assertion
      return;
    }

    const serviceData = serviceDoc.data();

    // Authorization: Check if authenticated user is the provider of the service
    // TODO: Implement admin role check if needed
    if (authenticatedUserId !== serviceData?.providerId) {
        (res as any).status(403).json({ error: 'Forbidden: You are not authorized to update this service' }); // Used type assertion
        return;
    }

    const updateData = (req as any).body; // Used type assertion

    // Implement data validation using Zod
    const validationResult = updateServiceSchema.safeParse(updateData);

    if (!validationResult.success) {
      (res as any).status(400).json({ // Used type assertion
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Corrected to .issues
      });
      return;
    }

    const validatedData = validationResult.data;

    // Update the service document with validated data and updated timestamp
    await serviceRef.update({
        ...validatedData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    (res as any).status(200).json({ message: 'Service updated successfully' }); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error updating service:', error);
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


export const deleteService = functions.https.onRequest(async (req: any, res: any) => { // Changed types to any
  // Allow only DELETE requests
  if ((req as any).method !== 'DELETE') { // Used type assertion
    (res as any).status(405).send('Method Not Allowed'); // Used type assertion
    return;
  }

  const serviceId = (req as any).url.split('/').pop(); // Used type assertion

  if (!serviceId) {
    (res as any).status(400).json({ error: 'Service ID is required' }); // Used type assertion
    return;
  }

  try {
    // Implement authentication and authorization (e.g., only the service's provider or Admin can delete)
    const authHeader = (req as any).headers.authorization; // Used type assertion
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      (res as any).status(401).json({ error: 'Unauthorized: No token provided' }); // Used type assertion
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const serviceRef = db.collection('services').doc(serviceId);
    const serviceDoc = await serviceRef.get();

    if (!serviceDoc.exists) {
      (res as any).status(404).json({ error: 'Service not found' }); // Used type assertion
      return;
    }

    const serviceData = serviceDoc.data();

    // Authorization: Check if authenticated user is the provider of the service
    // TODO: Implement admin role check if needed
    if (authenticatedUserId !== serviceData?.providerId) {
        (res as any).status(403).json({ error: 'Forbidden: You are not authorized to delete this service' }); // Used type assertion
        return;
    }

    // Delete the service document from Firestore
    await serviceRef.delete();

    (res as any).status(200).json({ message: 'Service deleted successfully' }); // Used type assertion
    return;

  } catch (error: unknown) { // Added type annotation
    console.error('Error deleting service:', error);
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
