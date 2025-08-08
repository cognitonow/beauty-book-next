import * as admin from 'firebase-admin';

// Define mockVerifyIdToken here to avoid redeclaration
let mockVerifyIdToken: jest.Mock;

// Mock firebase-admin before importing the functions
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(), // Keep initializeApp mock if needed
  auth: () => ({
    verifyIdToken: mockVerifyIdToken, // Reference the mock function
    createUser: jest.fn(), // Add mock createUser method
  }), // Removed duplicate createUser mock
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(), // Mock the get method
        update: jest.fn().mockResolvedValue(true), // Explicitly mock update
        delete: jest.fn(),
      })),
    })),
    FieldValue: {
 arrayUnion: jest.fn(() => 'mock-array-union'), // Explicitly mock arrayUnion
      arrayRemove: jest.fn(),
      serverTimestamp: jest.fn(() => 'mock-timestamp'), // Explicitly mock serverTimestamp
    } as any, // Add type assertion here
  }),
}));

const users = require('./users'); // Updated import

// Clean up the test environment after tests
afterAll(() => {
  // No cleanup needed with mocked firebase-admin
});

// Define a type for the mock request object that includes the 'user' property
type MockRequest = {
  method?: string;
  url?: string;
  headers?: { authorization?: string };
  body?: any;
  user?: { uid: string };
}; // Added semicolon here


describe('User Cloud Functions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-mock admin.auth().verifyIdToken before each test
    mockVerifyIdToken = jest.fn(); // Initialize before each test
    (admin.auth().verifyIdToken as jest.Mock).mockImplementation(mockVerifyIdToken);
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      // Mock authenticated user ID
      const authenticatedUserId = 'authenticated-user-id';
      const userIdInUrl = authenticatedUserId; // User updating their own profile

      // Mock request body with updated user data
      const updatedUserData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      // Mock request object
      const req: MockRequest = {
        method: 'PUT',
        url: `/api/users/${userIdInUrl}`,
        headers: {
          authorization: 'Bearer mock-id-token',
        },
        user: { // Add mock user object with uid
          uid: authenticatedUserId,
        },
        body: updatedUserData,
      };

      // Mock response object with type annotations
      const res: any = { // Using 'any' here for simplicity in mocking
        status: jest.fn((code: number) => res), // Add type annotation for status code
        json: jest.fn(), // Add type annotation for json
        send: jest.fn(), // Add type annotation for send
      };

 // Mock Firestore interactions - Document exists
      const mockDoc = {
 exists: true,
        data: jest.fn(() => ({})), // Provide a default empty data object
      };
 // Mock the doc and get methods
      const mockDocRef = {
 get: jest.fn().mockResolvedValue(mockDoc), // Ensure get returns the mockDoc
        update: jest.fn().mockResolvedValue(true), // Indicate successful update
      };

      const mockCollection = {
        doc: jest.fn(() => mockDocRef),
      };
      jest.spyOn(admin.firestore(), 'collection').mockReturnValue(mockCollection as any);
 // Get the update mock
      const mockUpdate = mockDocRef.update;

 // Mock admin.auth().verifyIdToken
      mockVerifyIdToken.mockResolvedValue({ uid: authenticatedUserId });

      // Call the function
      await users.updateUser(req as any, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
      // Verify that the update method was called with the correct data and timestamp
      expect(mockUpdate).toHaveBeenCalledWith({
        ...updatedUserData, // Should only include the fields that were updated
        updatedAt: 'mock-timestamp', // Expect the mock timestamp value
      });
    });


    it('should return 403 if authenticated user is not authorized to update', async () => {
      // Mock authenticated user ID and a different user ID for the URL
      const authenticatedUserId = 'authenticated-user-id';
      const userIdInUrl = 'another-user-id';

      // Mock request object with the different user ID in the URL
      const req: MockRequest = {
        method: 'PUT',
        url: `/api/users/${userIdInUrl}`,
        headers: {
          authorization: 'Bearer mock-id-token',
        },
        user: { // Add mock user object with uid
          uid: authenticatedUserId,
        },
        body: { name: 'Updated Name' }, // Request body is not relevant for this test
      };

      // Mock response object with type annotations
      const res: any = { // Using 'any' here for simplicity in mocking
        status: jest.fn((code: number) => res),
        json: jest.fn(),
      };

 // Mock Firestore interactions - Document exists for authorization check
      const mockDoc = {
        exists: true, // Document exists for authorization check
        data: jest.fn(() => ({})), // Provide a default empty data object if needed for authorization logic
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc), // Ensure get returns the mockDoc
        update: jest.fn().mockResolvedValue(true), // Mock update as it might be called after auth check if authorized
      };

      const mockCollection = {
        doc: jest.fn(() => mockDocRef),
      };
      jest.spyOn(admin.firestore(), 'collection').mockReturnValue(mockCollection as any);

 // Mock admin.auth().verifyIdToken
      mockVerifyIdToken.mockResolvedValue({ uid: authenticatedUserId });

      // Call the function
      await users.updateUser(req as any, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
    });

    it('should return 404 if user document is not found', async () => {
      // Mock authenticated user ID and user ID for the URL
      const authenticatedUserId = 'authenticated-user-id';
      const userIdInUrl = authenticatedUserId;

      // Mock request object
      const req: MockRequest = {
        method: 'PUT',
        url: `/api/users/${userIdInUrl}`,
        headers: {
          authorization: 'Bearer mock-id-token',
        },
        user: { // Add mock user object with uid
          uid: authenticatedUserId,
        },
        body: { name: 'Updated Name' }, // Request body is not relevant for this test
      };

      // Mock response object with type annotations
      const res: any = { // Using 'any' here for simplicity in mocking
        status: jest.fn((code: number) => res),
        json: jest.fn(),
      };

 // Mock admin.auth().verifyIdToken (authenticated)
      mockVerifyIdToken.mockResolvedValue({ uid: authenticatedUserId });

      // Mock Firestore interaction - Document does not exist
      const mockDoc = {
        exists: false,
      };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
      };
      const mockCollection = { doc: jest.fn(() => mockDocRef) };
      jest.spyOn(admin.firestore(), 'collection').mockReturnValue(mockCollection as any);

      // Call the function
      await users.updateUser(req as any, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 400 if provided with invalid data', async () => {
      // Mock authenticated user ID and user ID for the URL
      const authenticatedUserId = 'authenticated-user-id';
      const userIdInUrl = authenticatedUserId;

      // Mock request body with invalid data (e.g., number for name)
      const invalidUserData = {
        name: 123,
        bio: 'Some bio',
      };

      const req: MockRequest = {
        method: 'PUT',
        url: `/api/users/${userIdInUrl}`,
        headers: {
          authorization: 'Bearer mock-id-token',
        },
        user: { // Add mock user object with uid
          uid: authenticatedUserId,
        },
        body: invalidUserData, // Request body with invalid data
      };

      // Mock response object with type annotations
      const res: any = { // Using 'any' here for simplicity in mocking
        status: jest.fn((code: number) => res),
        json: jest.fn(),
      };

 // Mock admin.auth().verifyIdToken (authenticated)
      mockVerifyIdToken.mockResolvedValue({ uid: authenticatedUserId });

      // Mock Firestore interaction - Document exists (validation happens before Firestore interaction)
      const mockDoc = {
        exists: true,
        data: jest.fn(() => ({ providerId: userIdInUrl })), // Provide data if needed for validation logic
      };
      const mockDocRef = {
        get: jest.fn().mockResolvedValue(mockDoc),
        // update is not expected to be called in this test due to validation error
      };
      const mockCollection = { doc: jest.fn(() => mockDocRef) };
      jest.spyOn(admin.firestore(), 'collection').mockReturnValue(mockCollection as any);

      // Call the function
      await users.updateUser(req as any, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid data provided',
          details: expect.any(Array),
        })
      );
      // Optionally, you can check the details array content more specifically
      // expect(res.json.mock.calls[0][0].details[0]).toHaveProperty('path', ['name']);
      // expect(res.json.mock.calls[0][0].details[0]).toHaveProperty('code', 'invalid_type');
    });
  });

  // Test cases for deleteUser
  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // TODO: Write test case
    });
  });

  // Test cases for addFavoriteProvider
  describe('addFavoriteProvider', () => {
    it('should add a favorite provider', async () => {
      // TODO: Write test case
    });
  });

  // Test cases for removeFavoriteProvider
  describe('removeFavoriteProvider', () => {
    it('should remove a favorite provider', async () => {
      // TODO: Write test case
    });
  });

  // Test cases for createUser
  describe('createUser', () => {
    it('should create a new user document in Firestore', async () => {
      // Mock the data provided in the request body for creating a user.
      // Mock the request body with user data
      const newUserProfileData = {
        uid: 'test-user-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'http://example.com/photo.jpg',
        // Add any other fields your createUser function expects in the request body
      };

      // Mock the expected data that will be written to Firestore.
      // This should include the fields from newUserProfileData and any
      // default fields or server timestamps added by the createUser function.
      const expectedFirestoreData = {
        ...newUserProfileData,
        createdAt: 'mock-timestamp', // Expect the serverTimestamp mock value
        updatedAt: 'mock-timestamp', // Expect the serverTimestamp mock value
        favoriteProviders: [], // Expect an empty array by default
        // Add any other default fields set by createUser
      };

      // Mock the request object structure expected by the createUser function.
      // This usually involves a 'body' property containing the user data.
      const req: MockRequest = {
        method: 'POST',
        url: '/api/users',
        body: newUserProfileData,
      };
      
      // Mock response object
      const res: any = {
        status: jest.fn((code: number) => res),
        json: jest.fn(),
        send: jest.fn(),
      };

      // Mock the Firestore interactions: collection().doc().set().
      // We need to mock 'collection', 'doc', and 'set' in sequence.
      // Mock Firestore set operation
      const mockSet = jest.fn().mockResolvedValue(true);

      // Mock the doc() method to return an object with the mocked set() method.
      const mockDocRef = {
        set: mockSet,
      };

      // Mock the collection() method to return an object with the mocked doc() method.
      const mockCollection = {
        doc: jest.fn(() => mockDocRef),
      };

      // Spy on the firestore().collection() method to intercept the call
      // and return our mock collection object.
      jest.spyOn(admin.firestore(), 'collection').mockReturnValue(mockCollection as any);

      // We also need to mock the Firebase Auth createUser method if your
      // createUser function interacts with Firebase Auth *before* writing to Firestore.
      // Based on the typical flow, it would create an Auth user first.
      const mockCreateAuthUser = jest.fn().mockResolvedValue({ uid: newUserProfileData.uid });
      jest.spyOn(admin.auth(), 'createUser').mockImplementation(mockCreateAuthUser);

      // Call the function
      await users.createUser(req as any, res as any);

      // Assertions
      expect(mockCollection.doc).toHaveBeenCalledWith(newUserProfileData.uid);
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining(newUserProfileData)); // Expect user data to be set
      expect(mockCreateAuthUser).toHaveBeenCalledWith({ // Verify Firebase Auth user was created
        uid: newUserProfileData.uid,
        email: newUserProfileData.email,
        // Include other fields passed to auth().createUser()
      });
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining(expectedFirestoreData)); // Verify correct data structure is sent to Firestore
      expect(res.status).toHaveBeenCalledWith(201); // Expect 201 Created status code
      expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', userId: newUserProfileData.uid });
    });
    // TODO: Add test cases for error scenarios (e.g., missing uid, Firestore error)
  });
});
