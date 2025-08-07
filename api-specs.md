# API Specifications

This document details the API endpoints for the application's backend services.

## Base URL

`/api` (example)

## Authentication and User Management

### Register User

*   **Endpoint:** `/api/users/register`
*   **Method:** `POST`
*   **Description:** Registers a new user.
*   **Request Body (JSON):**
    
```
json
    {
      "role": "Looker" | "Provider",
      "name": "string",
      "email": "string",
      "password": "string",
      "phoneNumber": "string" (optional),
      "address": "string" (optional),
      "bio": "string" (optional, for Provider)
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "User registered successfully",
      "userId": "string"
    }
    
```
*   **Error Response (400 Bad Request):**
    
```
json
    {
      "error": "string"
    }
    
```
### Login User

*   **Endpoint:** `/api/users/login`
*   **Method:** `POST`
*   **Description:** Logs in an existing user.
*   **Request Body (JSON):**
```
json
    {
      "email": "string",
      "password": "string"
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "Login successful",
      "token": "string",
      "userId": "string",
      "role": "Looker" | "Provider"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Invalid credentials"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Get User Details

*   **Endpoint:** `/api/users/{id}`
*   **Method:** `GET`
*   **Description:** Get user details by ID. Requires authentication.
*   **URL Parameters:**
    *   `id`: User ID (string)
*   **Success Response (200 OK):**
    
```
json
    {
      "id": "string",
      "role": "Looker" | "Provider",
      "name": "string",
      "avatarUrl": "string",
      "email": "string",
      "phoneNumber": "string",
      "address": "string",
      "bio": "string",
      "skills": ["string"],
      "achievements": ["string"],
      "favoriteProviders": ["string"],
      "onboardingStatus": "string",
      "onlineStatus": "boolean",
      "lastActive": "timestamp"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Update User Details

*   **Endpoint:** `/api/users/{id}`
*   **Method:** `PUT`
*   **Description:** Update user details. Requires authentication.
*   **URL Parameters:**
    *   `id`: User ID (string)
*   **Request Body (JSON):**
```
json
    {
      "name": "string" (optional),
      "avatarUrl": "string" (optional),
      "phoneNumber": "string" (optional),
      "address": "string" (optional),
      "bio": "string" (optional),
      "skills": ["string"] (optional, for Provider)
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "User updated successfully"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Delete User Account

*   **Endpoint:** `/api/users/{id}`
*   **Method:** `DELETE`
*   **Description:** Delete a user account. Requires authentication.
*   **URL Parameters:**
    *   `id`: User ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "User deleted successfully"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Add Favorite Provider

*   **Endpoint:** `/api/users/{id}/favoriteproviders/{providerId}`
*   **Method:** `POST`
*   **Description:** Add a Provider to a Looker's favorites. Requires authentication.
*   **URL Parameters:**
    *   `id`: Looker User ID (string)
    *   `providerId`: Provider User ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Provider added to favorites"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User or Provider not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Remove Favorite Provider

*   **Endpoint:** `/api/users/{id}/favoriteproviders/{providerId}`
*   **Method:** `DELETE`
*   **Description:** Remove a Provider from a Looker's favorites. Requires authentication.
*   **URL Parameters:**
    *   `id`: Looker User ID (string)
    *   `providerId`: Provider User ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Provider removed from favorites"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User or Provider not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
## Service Catalog

### Get All Services

*   **Endpoint:** `/api/services`
*   **Method:** `GET`
*   **Description:** Get a list of all services.
*   **Query Parameters (Optional):**
    *   `category`: Filter by service category (string).
    *   `keyword`: Filter by associated keyword (string).
    *   `subCategory`: Filter by service sub-category (string).
    *   `locationDetails`: Filter by location details (e.g., Dublin district for Hair) (string).
    *   `providerId`: Filter by services offered by a specific provider (string).
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "name": "string",
        "subCategory": "string",
        "description": "string",
        "price": "number",
        "duration": "number",
      "tags": ["string"] (optional),
      "locationType": "string" (e.e., "Provider's Place", "Looker's Place", "Both") (optional, relevant for certain services),
      "locationDetails": "string" (optional, for specific location info like Dublin district for Hair services),
      "galleryImages": ["string"]
      ...
    ]
    
```
*   **Error Response (500 Internal Server Error):**
```
json
    {
      "error": "string"
    }
    
```
### Get Service Details

*   **Endpoint:** `/api/services/{id}`
*   **Method:** `GET`
*   **Description:** Get service details by ID.
*   **URL Parameters:**
    *   `id`: Service ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "id": "string",
      "name": "string",
      "category": "string", 
      "subCategory": "string",
      "description": "string",
      "price": "number",
      "duration": "number",
      "tags": ["string"] (optional),
      "locationType": "string" (optional),
      "locationDetails": "string" (optional),
      "galleryImages": ["string"]
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Service not found"
    }
    
```
### Create New Service (Admin/Provider)

*   **Endpoint:** `/api/services`
*   **Method:** `POST`
*   **Description:** Create a new service. Requires authentication and appropriate permissions.
*   **Request Body (JSON):**
```
json
    {
      "name": "string",
      "category": "string",
      "subCategory": "string",
      "description": "string",
      "price": "number",
      "duration": "number",
      "tags": ["string"] (optional),
      "locationType": "string" (optional),
      "locationDetails": "string" (optional),
      "galleryImages": ["string"] (optional)
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "Service created successfully",
      "serviceId": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Insufficient permissions"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Update Service Details (Admin/Provider)

*   **Endpoint:** `/api/services/{id}`
*   **Method:** `PUT`
*   **Description:** Update service details. Requires authentication and appropriate permissions.
*   **URL Parameters:**
    *   `id`: Service ID (string)
*   **Request Body (JSON):**
```
json
    {
      "name": "string" (optional),
      "category": "string" (optional),
      "subCategory": "string" (optional),
      "description": "string" (optional),
      "price": "number" (optional),
      "duration": "number" (optional),
      "tags": ["string"] (optional),
      "locationType": "string" (optional),
      "locationDetails": "string" (optional),
      "galleryImages": ["string"] (optional)
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "Service updated successfully"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Service not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Insufficient permissions"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Delete Service (Admin/Provider)

*   **Endpoint:** `/api/services/{id}`
*   **Method:** `DELETE`
*   **Description:** Delete a service. Requires authentication and appropriate permissions.
*   **URL Parameters:**
    *   `id`: Service ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Service deleted successfully"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Service not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Insufficient permissions"
    }
    
```
## Booking Management

### Create New Booking Request

*   **Endpoint:** `/api/bookings`
*   **Method:** `POST`
*   **Description:** Create a new booking request. Requires authentication.
*   **Request Body (JSON):**
```
json
    {
      "lookerId": "string",
      "providerId": "string",
      "services": [{"serviceId": "string", "location": "string" (optional)}] (allowing for location per service in booking),
      "serviceIds": ["string"],
      "dateTime": "datetime",
      "customRequest": "string" (optional)
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "Booking request created",
      "bookingId": "string",
      "status": "Pending Confirmation"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Get Booking Details

*   **Endpoint:** `/api/bookings/{id}`
*   **Method:** `GET`
*   **Description:** Get booking details by ID. Requires authentication.
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "id": "string",
      "lookerId": "string",
      "providerId": "string",
      "services": [{"serviceId": "string", "location": "string" (optional)}], // Updated to match request structure
      "serviceIds": ["string"],
      "dateTime": "datetime",
      "status": "string",
      "price": "number",
      "tipAmount": "number",
      "paymentStatus": "string",
      "reviewId": "string"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Booking not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Get User's Bookings

*   **Endpoint:** `/api/users/{userId}/bookings`
*   **Method:** `GET`
*   **Description:** Get a list of bookings for a specific user (Looker or Provider). Requires authentication.
*   **URL Parameters:**
    *   `userId`: User ID (string)
*   **Query Parameters (Optional):**
    *   `status`: Filter by booking status (string).
    *   `role`: Specify if the user is a "Looker" or "Provider" to filter relevant bookings.
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "lookerId": "string",
        "services": [{"serviceId": "string", "location": "string" (optional)}], // Updated to match request structure
        "providerId": "string",
        "serviceIds": ["string"],
        "dateTime": "datetime",
        "status": "string",
        "price": "number",
        "tipAmount": "number",
        "paymentStatus": "string",
        "reviewId": "string"
      },
      ...
    ]
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Confirm Booking (Provider)

*   **Endpoint:** `/api/bookings/{id}/confirm`
*   **Method:** `POST`
*   **Description:** Provider confirms a booking request. Requires authentication and Provider role.
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Booking confirmed",
      "status": "Awaiting Reservation"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Booking not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Only the assigned Provider can confirm"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Cancel Booking

*   **Endpoint:** `/api/bookings/{id}/cancel`
*   **Method:** `POST`
*   **Description:** User cancels a booking. Requires authentication.
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Booking cancelled",
      "status": "Cancelled"
    }
    
```
*   **Error Response (404 Not Found):**
    
```
json
    {
      "error": "Booking not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Complete Booking (Provider)

*   **Endpoint:** `/api/bookings/{id}/complete`
*   **Method:** `POST`
*   **Description:** Provider marks a booking as complete. Requires authentication and Provider role.
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "message": "Booking marked as complete",
      "status": "Completed"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Booking not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Only the assigned Provider can complete"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Authorize Payment (Placeholder)

*   **Endpoint:** `/api/bookings/{id}/authorize-payment`
*   **Method:** `POST`
*   **Description:** Authorize payment for a booking. Requires authentication. **(Placeholder - Actual Stripe integration needed later)**
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Request Body (JSON):**
```
json
    {
      "paymentMethodId": "string"
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "Payment authorized (placeholder)",
      "paymentStatus": "Authorized"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Booking not found"
    }
    
```
### Capture Payment (Placeholder)

*   **Endpoint:** `/api/bookings/{id}/capture-payment`
*   **Method:** `POST`
*   **Description:** Capture payment for a booking (including tip). Requires authentication. **(Placeholder - Actual Stripe integration needed later)**
*   **URL Parameters:**
    *   `id`: Booking ID (string)
*   **Request Body (JSON):**
```
json
    {
      "tipAmount": "number" (optional)
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "Payment captured (placeholder)",
      "paymentStatus": "Captured",
      "totalAmount": "number"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Booking not found"
    }
    
```
## Messaging

### Get Messages for Conversation

*   **Endpoint:** `/api/conversations/{conversationId}/messages`
*   **Method:** `GET`
*   **Description:** Get messages for a specific conversation. Requires authentication.
*   **URL Parameters:**
    *   `conversationId`: Conversation ID (string)
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "conversationId": "string",
        "senderId": "string",
        "text": "string",
        "imageUrl": "string" (optional),
        "timestamp": "datetime",
        "read": "boolean",
        "systemMessage": "boolean"
      },
      ...
    ]
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Conversation not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Send New Message

*   **Endpoint:** `/api/conversations/{conversationId}/messages`
*   **Method:** `POST`
*   **Description:** Send a new message in a conversation. Requires authentication.
*   **URL Parameters:**
    *   `conversationId`: Conversation ID (string)
*   **Request Body (JSON):**
```
json
    {
      "senderId": "string",
      "text": "string",
      "imageUrl": "string" (optional)
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "Message sent",
      "messageId": "string",
      "timestamp": "datetime"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Conversation not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
### Get User's Conversations

*   **Endpoint:** `/api/users/{userId}/conversations`
*   **Method:** `GET`
*   **Description:** Get a list of conversations for a user. Requires authentication.
*   **URL Parameters:**
    *   `userId`: User ID (string)
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "participantIds": ["string"],
        "lastMessage": {
          "text": "string",
          "timestamp": "datetime"
        },
        "unreadCount": "number",
        "bookingId": "string" (optional)
      },
      ...
    ]
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Get Conversation Details

*   **Endpoint:** `/api/conversations/{id}`
*   **Method:** `GET`
*   **Description:** Get conversation details by ID. Requires authentication.
*   **URL Parameters:**
    *   `id`: Conversation ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "id": "string",
      "participantIds": ["string"],
      "bookingId": "string" (optional)
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Conversation not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
## Review Management

### Submit New Review

*   **Endpoint:** `/api/reviews`
*   **Method:** `POST`
*   **Description:** Submit a new review for a completed booking. Requires authentication.
*   **Request Body (JSON):**
```
json
    {
      "bookingId": "string",
      "lookerId": "string",
      "providerId": "string",
      "rating": "number" (1-5),
      "text": "string",
      "images": ["string"] (optional),
      "categoryRatings": {
        "category1": "number",
        "category2": "number"
        // ... other categories
      } (optional)
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "Review submitted successfully",
      "reviewId": "string"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (409 Conflict):**
```
json
    {
      "error": "Review already submitted for this booking"
    }
    
```
### Get Reviews for Provider

*   **Endpoint:** `/api/providers/{providerId}/reviews`
*   **Method:** `GET`
*   **Description:** Get a list of reviews for a specific Provider.
*   **URL Parameters:**
    *   `providerId`: Provider User ID (string)
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "bookingId": "string",
        "lookerId": "string",
        "providerId": "string",
        "rating": "number",
        "text": "string",
        "images": ["string"],
        "timestamp": "datetime",
        "categoryRatings": {}
      },
      ...
    ]
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Provider not found"
    }
    
```
### Get Review Details

*   **Endpoint:** `/api/reviews/{id}`
*   **Method:** `GET`
*   **Description:** Get review details by ID.
*   **URL Parameters:**
    *   `id`: Review ID (string)
*   **Success Response (200 OK):**
```
json
    {
      "id": "string",
      "bookingId": "string",
      "lookerId": "string",
      "providerId": "string",
      "rating": "number",
      "text": "string",
      "images": ["string"],
      "timestamp": "datetime",
      "categoryRatings": {}
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Review not found"
    }
    
```
## Achievement Tracking

### Get User's Achievements

*   **Endpoint:** `/api/users/{userId}/achievements`
*   **Method:** `GET`
*   **Description:** Get a list of achievements for a user. Requires authentication.
*   **URL Parameters:**
    *   `userId`: User ID (string)
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "userId": "string",
        "badgeId": "string",
        "level": "number",
        "progress": "number" (0-1),
        "earnedDate": "datetime"
      },
      ...
    ]
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "User not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Get All Available Badges

*   **Endpoint:** `/api/badges`
*   **Method:** `GET`
*   **Description:** Get a list of all available badges and their criteria.
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "name": "string",
        "category": "string",
        "description": "string",
        "levels": [
          {
            "level": "number",
            "name": "string",
            "criteria": "string",
            "appearance": "string"
          }
        ] (for leveled badges),
        "criteria": "string" (for non-leveled badges)
      },
      ...
    ]
    
```
*   **Error Response (500 Internal Server Error):**
```
json
    {
      "error": "string"
    }
    
```
## Marketplace Request Management

### Submit New Marketplace Request

*   **Endpoint:** `/api/marketplacerequests`
*   **Method:** `POST`
*   **Description:** Submit a new service request from a Looker. Requires authentication.
*   **Request Body (JSON):**
    
```
json
    {
      "lookerId": "string",
      "serviceName": "string",
      "area": "string",
      "notes": "string" (optional),
      "notificationOptIn": "boolean"
    }
    
```
*   **Success Response (201 Created):**
```
json
    {
      "message": "Marketplace request submitted",
      "requestId": "string"
    }
    
```
*   **Error Response (400 Bad Request):**
```
json
    {
      "error": "string"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
### Get Marketplace Requests (Provider/Admin)

*   **Endpoint:** `/api/marketplacerequests`
*   **Method:** `GET`
*   **Description:** Get a list of marketplace requests. Requires authentication and appropriate permissions (Provider or Admin).
*   **Query Parameters (Optional):**
    *   `status`: Filter by request status (string).
    *   `area`: Filter by area (string).
*   **Success Response (200 OK):**
```
json
    [
      {
        "id": "string",
        "lookerId": "string",
        "serviceName": "string",
        "area": "string",
        "notes": "string",
        "notificationOptIn": "boolean",
        "timestamp": "datetime",
        "status": "string"
      },
      ...
    ]
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Insufficient permissions"
    }
    
```
### Update Marketplace Request Status (Provider/Admin)

*   **Endpoint:** `/api/marketplacerequests/{id}`
*   **Method:** `PUT`
*   **Description:** Update the status of a marketplace request. Requires authentication and appropriate permissions (Provider or Admin).
*   **URL Parameters:**
    *   `id`: Request ID (string)
*   **Request Body (JSON):**
    
```
json
    {
      "status": "string"
    }
    
```
*   **Success Response (200 OK):**
```
json
    {
      "message": "Marketplace request status updated"
    }
    
```
*   **Error Response (404 Not Found):**
```
json
    {
      "error": "Marketplace request not found"
    }
    
```
*   **Error Response (401 Unauthorized):**
```
json
    {
      "error": "Unauthorized"
    }
    
```
*   **Error Response (403 Forbidden):**
```
json
    {
      "error": "Forbidden: Insufficient permissions"
    }
    
```
## File Storage (Implied)

While not explicitly detailed with endpoints, the need for file storage (e.g., for avatars and portfolio images) implies endpoints for:

*   **POST /api/files/upload:** Upload a file.
*   **GET /api/files/{filename}:** Retrieve a file.

The request/response formats would depend on the chosen file storage service (e.g., direct upload URLs, multipart form data).

## Notifications (Implied)

Similarly, while not explicitly detailed, the Notification Service would involve backend logic to trigger notifications based on events (e.g., new booking request, message received, booking confirmation). This might not require dedicated API endpoints for the frontend to call directly, but rather internal communication within the backend or integration with a messaging service like Firebase Cloud Messaging.

## Availability Management (Provider)

Endpoints for managing provider availability would likely include:

*   **GET /api/providers/{providerId}/availability:** Get a provider's availability.
*   **POST /api/providers/{providerId}/availability/recurring:** Set recurring availability hours.
*   **POST /api/providers/{providerId}/availability/blocked-time:** Create a one-off blocked time event.
*   **DELETE /api/providers/{providerId}/availability/blocked-time/{id}:** Delete a blocked time event.

The request/response formats would involve defining the structure of availability data (e.g., days of the week, time slots, blocked time periods