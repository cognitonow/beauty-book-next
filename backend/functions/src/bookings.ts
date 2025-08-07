import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod';

admin.initializeApp();
const db = admin.firestore();

const createBookingRequestSchema = z.object({
  lookerId: z.string(),
  providerId: z.string(),
  services: z.array(z.object({
      serviceId: z.string(),
      location: z.string().optional(),
  })),
  // serviceIds: z.array(z.string()), // This seems redundant if services array is used
  dateTime: z.string(), // Assuming datetime is sent as a string, you might want to refine this validation
  customRequest: z.string().optional(),
  // Note: The API spec has both 'services' and 'serviceIds'.
  // Assuming 'services' with location is the intended structure for the request body.
  // If 'serviceIds' is also needed, its validation should be added here.
});


export const createBookingRequest = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const bookingData = req.body;

    // Authorization: Ensure authenticated user is the looker in the request
    if (authenticatedUserId !== bookingData.lookerId) {
        res.status(403).json({ error: 'Forbidden: Cannot create booking for another user' });
        return; // Added return
    }

    // Implement data validation using Zod
    const validationResult = createBookingRequestSchema.safeParse(bookingData);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Corrected to .issues
      });
      return; // Added return
    }

    // TODO: Calculate basePrice based on services. This requires fetching service details.
    // For now, we'll add a placeholder or assume it's calculated on the frontend and validated here.
    // Assuming basePrice is included and validated in the schema for now, or calculated later.
    // Let's add basePrice: z.number().positive() to createBookingRequestSchema
    // And include it in the validated data.

    const newBookingData = {
        ...validationResult.data, // Use validated data
        status: 'pending_provider_confirmation', // Initial status
        paymentStatus: 'pending_authorization', // Initial payment status
        basePrice: 0, // Placeholder - implement price calculation
        tipAmount: 0, // Initial tip amount
        totalPrice: 0, // Initial total price
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Ensure serviceIds array is populated if needed, perhaps from the services array
        serviceIds: validationResult.data.services.map(service => service.serviceId),
    };


    const docRef = await db.collection('bookings').add(newBookingData);


    res.status(201).json({ message: 'Booking request created', bookingId: docRef.id, status: newBookingData.status });
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error creating booking request:', error);
    // Handle specific Firebase Auth errors
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});


export const capturePayment = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

   // TODO: Implement authentication and authorization for payment operations
   // Ensure the user is authorized to capture payment (e.g., the provider for a confirmed booking)

  try {
    // Placeholder implementation - Replace with actual Stripe capture logic
    console.log(`Placeholder: Capturing payment for booking ${bookingId}`);

    // TODO: Update booking status to 'captured' in Firestore


    res.status(200).json({ message: 'Payment captured (placeholder)', paymentStatus: 'Captured', totalAmount: 0 }); // Placeholder totalAmount
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error capturing payment (placeholder):', error);
    // Handle specific Stripe or Firestore errors
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
        // Handle specific Stripe or Firestore errors if needed
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});

export const getBookingDetails = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return; // Added return
    }

    const bookingData = bookingDoc.data();

    // Authorization: Check if the user is the looker or provider
    if (authenticatedUserId !== bookingData?.lookerId && authenticatedUserId !== bookingData?.providerId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to view this booking' });
        return; // Added return
    }


    const booking = {
      id: bookingDoc.id,
      ...bookingData
    };


    res.status(200).json(booking);
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error getting booking details:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});

export const getUserBookings = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const userId = req.url.split('/').pop(); // Extract user ID from URL

  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    // Authorization: Compare authenticated user ID with userId in URL
    if (authenticatedUserId !== userId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to view other users\' bookings' });
        return; // Added return
    }


    // Extract optional query parameters
    const { status, role } = req.query;

    let bookingsRef: admin.firestore.CollectionReference | admin.firestore.Query = db.collection('bookings');

    // Build query based on role and user ID
    if (role === 'Looker') {
        bookingsRef = bookingsRef.where('lookerId', '==', authenticatedUserId);
    } else if (role === 'Provider') {
        bookingsRef = bookingsRef.where('providerId', '==', authenticatedUserId);
    } else {
        // If no role specified, get bookings where user is either looker or provider
        // Note: Firestore doesn't support OR queries directly on different fields.
        // For this case, we might need to perform two separate queries and merge results,
        // or use a collection group query if bookings were in subcollections under users.
        // For simplicity here, we'll assume role is usually specified or fetch all and filter,
        // or use a composite index and IN query if feasible and necessary for performance.
        // Let's proceed with filtering by lookerId OR providerId after fetching for now,
        // or fetch based on authenticatedUserId being in a hypothetical 'participants' array
        // if we modified the booking data structure to include such an array.

        // Alternative (simpler but less efficient for large collections without proper indexing):
        // Fetch all bookings and filter client-side. Not recommended for large datasets.

        // A better approach for this schema:
        // If no role specified, fetch all bookings where authenticatedUserId is either lookerId OR providerId.
        // This still requires careful indexing or two queries.
        // Let's use two queries and merge for correctness with current schema:
        const lookerBookingsQuery = db.collection('bookings').where('lookerId', '==', authenticatedUserId);
        const providerBookingsQuery = db.collection('bookings').where('providerId', '==', authenticatedUserId);

        let combinedBookings: admin.firestore.Query[] = [lookerBookingsQuery, providerBookingsQuery];

        if (status) {
            combinedBookings = combinedBookings.map(query => query.where('status', '==', status as string));
        }

        const snapshots = await Promise.all(combinedBookings.map(query => query.get()));

        const bookings = snapshots.flatMap(snapshot =>
            snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        );

         // Remove duplicates if a booking could somehow have the same user as both looker and provider (unlikely but good practice)
        const uniqueBookings = Array.from(new Map(bookings.map(item => [item['id'], item])).values());


        res.status(200).json(uniqueBookings);
        return; // Added return

    }

    // If role is specified, add the status filter if present
    if (status && (role === 'Looker' || role === 'Provider')) {
         bookingsRef = bookingsRef.where('status', '==', status as string);
    }


    const snapshot = await bookingsRef.get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    res.status(200).json(bookings);
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error getting user bookings:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
        // Handle case where user might not exist (though auth check should cover this)
         if (error.code === 'auth/user-not-found') {
             res.status(404).json({ error: 'User not found' });
             return; // Added return
         }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});

export const confirmBooking = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return; // Added return
    }

    const bookingData = bookingDoc.data();

    // Authorization & Status Check: Check if authenticatedUserId is bookingData.providerId and status is not completed
    if (authenticatedUserId !== bookingData?.providerId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to confirm this booking' });
        return; // Added return
    }

    if (bookingData?.status !== 'pending_provider_confirmation') {
         res.status(400).json({ error: 'Booking status is not pending confirmation' });
         return; // Added return
    }


    // Update the booking status in Firestore
    await bookingRef.update({
        status: 'awaiting_reservation',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    res.status(200).json({ message: 'Booking confirmed', status: 'awaiting_reservation' });
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error confirming booking:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});

export const cancelBooking = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return; // Added return
    }

    const bookingData = bookingDoc.data();

    // Authorization: Check if the user is the looker or provider
    if (authenticatedUserId !== bookingData?.lookerId && authenticatedUserId !== bookingData?.providerId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to cancel this booking' });
        return; // Added return
    }

    // Cancellation status check: Check if bookingData.status is NOT 'completed' AND NOT 'cancelled'.
    if (bookingData?.status === 'completed' || bookingData?.status === 'cancelled') {
         res.status(400).json({ error: `Booking cannot be cancelled in ${bookingData.status} status` });
         return; // Added return
    }


    // Update the booking status in Firestore
    await bookingRef.update({
        status: 'cancelled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    res.status(200).json({ message: 'Booking cancelled', status: 'cancelled' });
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error cancelling booking:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});

export const completeBooking = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

  try {
    // Implement authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });
      return; // Added return
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const authenticatedUserId = decodedToken.uid;

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return; // Added return
    }

    const bookingData = bookingDoc.data();

    // Authorization & Status Check: Check if authenticatedUserId is bookingData.providerId and status is not completed
    if (authenticatedUserId !== bookingData?.providerId) {
        res.status(403).json({ error: 'Forbidden: You are not authorized to complete this booking' });
        return; // Added return
    }

    if (bookingData?.status === 'completed') {
         res.status(400).json({ error: 'Booking is already completed' });
         return; // Added return
    }


    // Update the booking status in Firestore
    await bookingRef.update({
        status: 'completed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    res.status(200).json({ message: 'Booking completed successfully', status: 'completed' });
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error completing booking:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
         if (error.code === 'auth/argument-error' || error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
            res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
            return; // Added return
        }
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});


export const authorizePayment = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return; // Added return
  }

  const bookingId = req.url.split('/').pop(); // Extract booking ID from URL

  if (!bookingId) {
    res.status(400).json({ error: 'Booking ID is required' });
    return; // Added return
  }

  // TODO: Implement authentication and authorization for payment operations

  try {
    // Placeholder implementation - Replace with actual Stripe authorization logic
    console.log(`Placeholder: Authorizing payment for booking ${bookingId}`);


    // TODO: Update booking status to 'authorized' in Firestore


    res.status(200).json({ message: 'Payment authorized (placeholder)', paymentStatus: 'Authorized' });
    return; // Added return

  } catch (error: unknown) { // Added type annotation
    console.error('Error authorizing payment (placeholder):', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Added type guard
        // Handle specific authorization errors if needed
     }
    res.status(500).json({ error: 'Internal server error' });
    return; // Added return
  }
});
