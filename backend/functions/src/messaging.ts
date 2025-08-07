import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod'; // Ensure Zod is imported

admin.initializeApp();
const db = admin.firestore();

// Define the schema for sendMessage
const sendMessageSchema = z.object({
  senderId: z.string(),
  text: z.string().optional(), // Text is optional if imageUrl is provided
  imageUrl: z.string().url().optional(), // imageUrl is optional if text is provided
  // Ensure at least one of text or imageUrl is provided (handled in logic)
});

export const getMessagesForConversation = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const conversationId = req.url.split('/').pop(); // Extract conversation ID from URL

  if (!conversationId) {
    res.status(400).json({ error: 'Conversation ID is required' });
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

    // Get conversation document to check participation
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversationData = conversationDoc.data();

    // Authorization: Check if authenticated user is a participant
    if (!conversationData?.participantIds || !conversationData.participantIds.includes(authenticatedUserId)) {
        res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation' });
        return;
    }

    // Retrieve messages for the conversation, ordered by timestamp
    const messagesRef = db.collection('messages')
      .where('conversationId', '==', conversationId)
      .orderBy('timestamp', 'asc'); // Or 'desc' depending on desired order

    const snapshot = await messagesRef.get();

    const messages = snapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => ({ // Add type annotation for doc
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(messages);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting messages for conversation:', error);
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

export const sendMessage = functions.https.onRequest(async (req, res) => {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const conversationId = req.url.split('/').pop(); // Extract conversation ID from URL

  if (!conversationId) {
    res.status(400).json({ error: 'Conversation ID is required' });
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

    // Get conversation document to check participation
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversationData = conversationDoc.data();

    // Authorization: Check if authenticated user is a participant
    if (!conversationData?.participantIds || !conversationData.participantIds.includes(authenticatedUserId)) {
        res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation' });
        return;
    }

    const messageData = req.body;

    // Implement data validation using Zod
    const validationResult = sendMessageSchema.safeParse(messageData);

    if (!validationResult.success) {
      res.status(400).json({
        error: 'Invalid data provided',
        details: validationResult.error.issues, // Use .issues instead of .errors
      });
      return;
    }

    // Check if at least text or imageUrl is provided
    if (!validationResult.data.text && !validationResult.data.imageUrl) {
         res.status(400).json({ error: 'Either text or imageUrl must be provided' });
         return;
    }

    // Security check: Ensure senderId in request matches authenticated user ID
    if (validationResult.data.senderId !== authenticatedUserId) {
         res.status(403).json({ error: 'Forbidden: Cannot send message on behalf of another user' });
         return;
    }


    // Save the new message document to Firestore
    const newMessageData = {
        ...validationResult.data, // Use validated data
        conversationId: conversationId,
        senderId: authenticatedUserId, // Use authenticated user ID for senderId
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false, // New messages are initially unread
        systemMessage: false,
    };

    const docRef = await db.collection('messages').add(newMessageData);


    // Update the corresponding conversation document
    await conversationRef.update({
        lastMessageId: docRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // TODO: Potentially update unreadCount for the recipient(s)
    });


    res.status(201).json({
        message: 'Message sent',
        messageId: docRef.id,
        timestamp: newMessageData.timestamp,
    });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error sending message:', error);
    // Handle specific Firebase Auth errors
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

export const getUserConversations = functions.https.onRequest(async (req, res) => {
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
        res.status(403).json({ error: 'Forbidden: You are not authorized to view other users\' conversations' });
        return;
    }

    // Retrieve conversation documents where authenticated user is a participant
    const conversationsRef = db.collection('conversations')
        .where('participantIds', 'array-contains', authenticatedUserId)
        .orderBy('updatedAt', 'desc');

    const snapshot = await conversationsRef.get();

    const conversations = snapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => ({ // Add type annotation for doc
      id: doc.id,
      ...doc.data()
      // Note: Not including last message details to avoid N+1 reads.
      // If needed, fetch last message separately on the frontend or store summary in conversation document.
    }));

    res.status(200).json(conversations);
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting user conversations:', error);
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

export const getConversationDetails = functions.https.onRequest(async (req, res) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const conversationId = req.url.split('/').pop(); // Extract conversation ID from URL

  if (!conversationId) {
    res.status(400).json({ error: 'Conversation ID is required' });
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

    // Get conversation document to check participation
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const conversationData = conversationDoc.data();

    // Authorization: Check if authenticated user is a participant
    if (!conversationData?.participantIds || !conversationData.participantIds.includes(authenticatedUserId)) {
        res.status(403).json({ error: 'Forbidden: You are not a participant in this conversation' });
        return;
    }

    // Return the conversation data (including ID)
    res.status(200).json({
        id: conversationDoc.id,
        ...conversationData,
    });
    return;

  } catch (error: unknown) { // Add type annotation for error
    console.error('Error getting conversation details:', error);
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
