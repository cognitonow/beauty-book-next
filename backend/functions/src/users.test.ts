import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as firebaseFunctionsTest from 'firebase-functions-test'; // Changed import to use * as

// Initialize firebase-functions-test
const testEnv = firebaseFunctionsTest({ projectId: 'your-project-id' }); // Removed .default. Replace with your Firebase project ID

// Import your users Cloud Functions using require after testEnv initialization
const users = require('./users'); // Updated import

// Clean up the test environment after tests
afterAll(() => {
  testEnv.cleanup();
});

describe('User Cloud Functions', () => {
  // Test cases for updateUser
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
      const req = {
        method: 'PUT',
        url: `/api/users/${userIdInUrl}`,
        headers: {
          authorization: 'Bearer mock-id-token',
        },
        body: updatedUserData,
      };

      // Mock response object with type annotations
      const res: any = { // Using 'any' here for simplicity in mocking
        status: jest.fn((code: number) => res) as any, // Add type annotation for status code
        json: jest.fn() as any, // Add type annotation for json
        send: jest.fn() as any, // Add type annotation for send
      };


      // Mock admin.auth().verifyIdToken
      const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: authenticatedUserId });
      jest.spyOn(admin.auth(), 'verifyIdToken').mockImplementation(mockVerifyIdToken);

      // Mock Firestore update operation
      const mockUpdate = jest.fn().mockResolvedValue(true); // Indicate successful update
      const mockDoc = {
          exists: true,
          data: () => ({ providerId: userIdInUrl })
      };
      const mockGet = jest.fn().mockResolvedValue(mockDoc); // Removed 'as any'
      const mockDocRef = {
          get: mockGet,
          update: mockUpdate,
      };
      const mockCollection = {
          doc: jest.fn((docId: string) => { // Added type annotation for docId
               // Ensure doc is called with the correct userId
               expect(docId).toBe(userIdInUrl);
               return mockDocRef;
          }),
      };
      const mockFirestore = {
          collection: jest.fn((collectionName: string) => { // Added type annotation for collectionName
               // Ensure collection is called with 'users'
               expect(collectionName).toBe('users');
               return mockCollection;
          }),
          FieldValue: {
              serverTimestamp: jest.fn(() => 'mock-timestamp'), // Mock timestamp
          },
      };

      jest.spyOn(admin, 'firestore' as any).mockImplementation(() => mockFirestore);


      // Call the function
      await users.updateUser(req as any, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully' });
      // Verify that the update method was called with the correct data and timestamp
      expect(mockUpdate).toHaveBeenCalledWith({
          ...updatedUserData,
          updatedAt: 'mock-timestamp',
      });
    });

    it('should return 403 if authenticated user is not authorized to update', async () => {
        // Mock authenticated user ID and a different user ID for the URL
        const authenticatedUserId = 'authenticated-user-id';
        const userIdInUrl = 'another-user-id';

        // Mock request object with the different user ID in the URL
        const req = {
            method: 'PUT',
            url: `/api/users/${userIdInUrl}`,
            headers: {
                authorization: 'Bearer mock-id-token',
            },
            body: { name: 'Updated Name' }, // Request body is not relevant for this test
        };

       // Mock response object with type annotations
        const res: any = { // Using 'any' here for simplicity in mocking
            status: jest.fn((code: number) => res) as any, // Add type annotation for status code
            json: jest.fn() as any, // Add type annotation for json
            send: jest.fn() as any, // Add type annotation for send
        };

        // Mock admin.auth().verifyIdToken to return the authenticated user ID
        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: authenticatedUserId });
        jest.spyOn(admin.auth(), 'verifyIdToken').mockImplementation(mockVerifyIdToken);

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
        const req = {
            method: 'PUT',
            url: `/api/users/${userIdInUrl}`,
            headers: {
                authorization: 'Bearer mock-id-token',
            },
            body: { name: 'Updated Name' },
        };

        // Mock response object with type annotations
        const res: any = { // Using 'any' here for simplicity in mocking
            status: jest.fn((code: number) => res) as any, // Add type annotation for status code
            json: jest.fn() as any, // Add type annotation for json
            send: jest.fn() as any, // Add type annotation for send
        };

        // Mock admin.auth().verifyIdToken
        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: authenticatedUserId });
        jest.spyOn(admin.auth(), 'verifyIdToken').mockImplementation(mockVerifyIdToken);

        // Mock Firestore get operation to return a non-existing document
        const mockDoc = {
            exists: false,
        };
        const mockGet = jest.fn().mockResolvedValue(mockDoc); // Removed 'as any'
        const mockDocRef = {
            get: mockGet,
        };
        const mockCollection = {
            doc: jest.fn((docId: string) => { // Added type annotation for docId
                expect(docId).toBe(userIdInUrl);
                return mockDocRef;
            }),
        };
        const mockFirestore = {
            collection: jest.fn((collectionName: string) => { // Added type annotation for collectionName
                expect(collectionName).toBe('users');
                return mockCollection;
            }),
        };
        jest.spyOn(admin, 'firestore' as any).mockImplementation(() => mockFirestore);

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

        // Mock request object with invalid data (e.g., number for name)
        const invalidUserData = {
            name: 123,
            bio: 'Some bio',
        };

        const req = {
            method: 'PUT',
            url: `/api/users/${userIdInUrl}`,
            headers: {
                authorization: 'Bearer mock-id-token',
            },
            body: invalidUserData,
        };

        // Mock response object with type annotations
        const res: any = { // Using 'any' here for simplicity in mocking
            status: jest.fn((code: number) => res) as any, // Add type annotation for status code
            json: jest.fn() as any, // Add type annotation for json
            send: jest.fn() as any, // Add type annotation for send
        };

        // Mock admin.auth().verifyIdToken
        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: authenticatedUserId });
        jest.spyOn(admin.auth(), 'verifyIdToken').mockImplementation(mockVerifyIdToken);

        // Mock Firestore get operation to return an existing document (validation happens before Firestore interaction)
        const mockDoc = {
            exists: true,
            data: () => ({ providerId: userIdInUrl })
        };
        const mockGet = jest.fn().mockResolvedValue(mockDoc); // Removed 'as any'
         const mockDocRef = {
             get: mockGet,
             // No need to mock update as it shouldn\'t be called
         };
         const mockCollection = {
             doc: jest.fn(() => mockDocRef),
         };
         const mockFirestore = {
             collection: jest.fn(() => mockCollection),
             FieldValue: {
                serverTimestamp: jest.fn(),
            },
         };
         jest.spyOn(admin, 'firestore' as any).mockImplementation(() => mockFirestore);


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
         expect(res.json.mock.calls[0][0].details[0]).toHaveProperty('path', ['name']);
         expect(res.json.mock.calls[0][0].details[0]).toHaveProperty('code', 'invalid_type');
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
});
