import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod';

admin.initializeApp();
const db = admin.firestore();

const submitReviewSchema = z.object({
    bookingId: z.string(),
    lookerId: z.string(), // Included for validation and clarity, but senderId from auth will be used
    providerId: z.string(), // Included for validation and clarity, but fetched from booking
    rating: z.number().int().min(1).max(5), // Rating is 1-5 integer
    text: z.string().optional(),
    images: z.array(z.string().url()).optional(), // Assuming images are URLs
    categoryRatings: z.object({
        cleanliness: z.number().int().min(1).max(5).optional(),
        punctuality: z.number().int().min(1).max(5).optional(),
        skill: z.number().int().min(1).max(5).optional(),
        professionalism: z.number().int().min(1).max(5).optional(),
    }).optional(),
});

export const submitReview = functions.https.onRequest(async (req, res) => {
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

    const reviewData = req.body;

    // Implement data validation using Zod
    const validationResult = submitReviewSchema.safeParse(reviewData);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Use .issues instead of .errors
      });
      return;
    }

    const validatedData = validationResult.data;

    // Get booking document to verify authorization and status
    const bookingRef = db.collection('bookings').doc(validatedData.bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const bookingData = bookingDoc.data();

    // Authorization: Check if authenticated user is the looker for this booking
    if (authenticatedUserId !== bookingData?.lookerId) {
        res.status(403).json({ error: 'Forbidden: You can only review your own bookings' });
        return;
    }

    // Booking Status Check: Check if booking status is 'completed'
    if (bookingData?.status !== 'completed') {
        res.status(400).json({ error: 'Cannot submit review for a booking that is not completed' });
        return;
    }

    // Check if booking has already been reviewed
    if (bookingData?.reviewId) {
        res.status(409).json({ error: 'Review already submitted for this booking' });
        return;
    }

    // Create the new review data object
    const newReviewData = {
        bookingId: validatedData.bookingId,
        lookerId: authenticatedUserId, // Use authenticated user ID
        providerId: bookingData.providerId, // Get providerId from booking data
        overallRating: validatedData.rating,
        text: validatedData.text,
        imageUrls: validatedData.images,
        categoryRatings: validatedData.categoryRatings,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('reviews').add(newReviewData);


    // Update the corresponding booking document to set the reviewId
    await bookingRef.update({
        reviewId: docRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });


    // TODO: Potentially update the provider's overall rating/aggregate reviews


    res.status(201).json({
        message: 'Review submitted successfully',
        reviewId: docRef.id,
    });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error submitting review:', error);
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


export const getProviderReviews = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const providerId = req.url.split('/').pop(); // Extract provider ID from URL

  if (!providerId) {
    res.status(400).json({ error: 'Provider ID is required' });
    return;
  }

  try {
    // Retrieve review documents from Firestore filtered by providerId
    const reviewsRef = db.collection('reviews').where('providerId', '==', providerId);

    const snapshot = await reviewsRef.get();

    const reviews = snapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => ({ // Add type annotation for doc
      id: doc.id,
      ...doc.data()
    }));


    res.status(200).json(reviews);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting provider reviews:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Type guard
        // Handle specific errors if needed
     }
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

export const getReviewDetails = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const reviewId = req.url.split('/').pop(); // Extract review ID from URL

  if (!reviewId) {
    res.status(400).json({ error: 'Review ID is required' });
    return;
  }

  try {
    // Get a reference to the review document
    const reviewRef = db.collection('reviews').doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Return the review data (including ID)
    res.status(200).json({
        id: reviewDoc.id,
        ...reviewDoc.data(),
    });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting review details:', error);
     if (typeof error === 'object' && error !== null && 'code' in error) { // Type guard
        // Handle specific errors if needed
     }
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});
