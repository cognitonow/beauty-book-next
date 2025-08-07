# Blueprint

## Overview

This document outlines the key components, user flows, and development progress for the beauty booking application. It serves as a central blueprint for the project's structure and functionality.

## Project Outline

### Atomic / Reusable Elements:

- **Badge:**
    - **Component Type:** Atomic / Reusable Element
    - **Purpose:** To display a status, achievement, or a leveled skill, using a clear visual hierarchy.
    - **Interactivity:** When tapped, a pop-up shows the badge's meaning, its current level, and the criteria needed to reach the next level.
    - **Badge Category 3: Leveled Skill & Service Badges:** Each skill badge will have multiple levels that a Provider can achieve. Example: "Gel Manicure"
        - **Level 0: Declared:**
            - **How to Earn:** Provider selects the skill during onboarding.
            - **Appearance:** Simple, "unfilled" or greyed-out badge.
            - **Text:** Gel Manicure
        - **Level 1: Verified (Bronze 🥉):**
            - **How to Earn:** Complete one booking including the service.
            - **Appearance:** Badge activates with standard brand color and a bronze border.
            - **Text:** Verified: Gel Manicure
        - **Level 2: Experienced (Silver 🥈):**
            - **How to Earn:** Complete 10 bookings with 9.0+ average rating for the service.
            - **Appearance:** Badge levels up with a silver border and more detailed icon.
            - **Text:** Experienced: Gel Manicure
        - **Level 3: Expert (Gold 🏅):**
            - **How to Earn:** Complete 50 bookings with 9.5+ average rating for the service.
            - **Appearance:** Highest tier with a shimmering gold border and increased prominence.
            - **Text:** Expert: Gel Manicure
    - **Handling Multiple Services in One Session:** The booking system must support line items, allowing completion credit to be added to multiple service badges simultaneously for a single booking.
- **Button:**
    - **Component Type:** Atomic / Reusable Element
    - **Purpose:** To allow a user to trigger a specific action with a single tap, using a clear, icon-driven, and color-coded system.
    - **Visual Style & Appearance:**
        - **Shape:** Rounded (perfect circle for icon-only, "pill" for icon + text).
        - **Content:** Always contains an icon, can be icon-only or icon paired with text.
        - **Color Coding:**
            - **Primary:** Main brand color (most important positive actions).
            - **Secondary:** Neutral color (standard, less critical actions).
            - **Destructive:** Warning color (irreversible or negative actions).
    - **States:** Default, Pressed, Disabled, Loading (shows LoadingSpinner).
    - **Sizes:** Default, Small.
    - **Used In:** Virtually every screen.
- **Status Indicators:**
    - **Component Type:** Atomic / Reusable Element
    - **Purpose:** To provide Lookers with real-time, contextual information about a Provider's current availability and proximity.
    - **Placement in Flow:** Small overlays in the top corners of Provider cards (Preview View, Card View).
    - **Indicator 1: Online Status:**
        - **Visual Element:** Small, solid green circle icon with a subtle white border.
        - **Display Logic:** Shown in top-right corner if the Provider has been active in the app within the last 5 minutes.
        - **Purpose for the Looker:** Signals quick response time, encourages engagement.
        - **Purpose for the Looker:** Highlights conveniently located Providers for in-person services.

### Composite Components:

- **BookingListItem:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a clear and scannable summary of a single booking (past, present, or future) within the CalendarManagementScreen's "List View." Its primary function is to provide key information at a glance, with a strong emphasis on the booking's current status.
    - **Placement in Flow:** Used as a repeating item in the vertically scrolling list on the "List View" of the CalendarManagementScreen.
    - **Layout & Key Elements:** Designed as a clean, rectangular card or list row.
        - **Looker Information (Left Side):** Looker's Avatar and Name.
        - **Booking Details (Center):** Service Name(s) and Date & Time.
        - **Status & Price (Right Side):** Prominent, color-coded "pill-shaped" Status Badge ([ Confirmed ], [ Completed ], [ Pending ], [ Awaiting Payment ], [ Cancelled ]) and the total Price.
    - **User Actions / Interactivity:** Tapping opens the detailed BookingDetailPopup modal.
    - **Technical Notes:** Highly data-driven, receives a "booking" data object containing Looker details, service info, date/time, price, and status.
- **ConversationListItem:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a summary of a conversation in the InboxScreen.
    - **Placement in Flow:** Used as a repeating item in the vertically scrolling list on the InboxScreen.
    - **Layout & Key Elements:** Row with Avatar, User Name (bold), Message Preview, Timestamp, Unread Indicator (colored dot), and Contextual Link (Booking Info).
- **FeaturedProfilesCarousel:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a carousel of featured provider profiles on the DiscoveryScreen.
    - **Placement in Flow:** Located below the search bar on the DiscoveryScreen.
    - **Layout & Key Elements:** Horizontally scrolling section titled "Featured This Week." Displays 3 Providers using the ProviderMediumView component.
- **PastBookingItem:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a clear and concise summary of a single past appointment within the Looker's BookingHistoryScreen and provide a one-tap "Book Again" shortcut.
    - **Placement in Flow:** Used as a list item on the BookingHistoryScreen.
    - **Layout & Key Elements:** Clean, rectangular card with sections for Provider Information (Avatar, Name, date), Booking Details (service(s), final amount), and Action Area (Review link/display, [ Book Again ] button).
    - **User Actions / Interactivity:** Tap card area (navigate to detailed receipt/read-only view), Tap "View Your Review" link (open review pop-up), Tap [ Book Again ] button (navigate to BookingScreen pre-configured with Provider/Service).
    - **Technical Notes:** Receives a "booking" data object with provider/service details, price, and review link.
- **ProviderCardView:**
    - **Component Type:** Composite Component
    - **Purpose:** To serve as the primary interactive component for the Tinder-style, side-swiping discovery section of the app. Provides a rich summary of a Provider for quick "yes/no" decisions.
    - **Placement in Flow:** The main card used in the large, swipeable stack on the DiscoveryScreen.
    - **Layout & Key Elements:** Larger, vertically oriented card with a 70/30 visual split.
        - **Top 70% (Image Area):** High-quality display picture showcasing Provider's work/brand/salon. Overlaid Online Status Indicator (top-right) and Proximity Status Indicator (top-left if within 3km).
        - **Bottom 30% (Info Block):** Solid block with Provider Name & Score, Bio Snippet, and a horizontally scrolling row of most relevant/highest-leveled Skill Badges.
    - **User Actions / Interactivity:**
        - **Swipe Right:** Adds Provider to Looker's "My Favourite Providers" list.
        - **Swipe Left:** Dismisses Provider from the current discovery stack.
        - **Tap:** Navigates to the Full Profile View (ProviderDetailView) for a detailed look.
- **ProviderMediumView:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a medium-sized preview of a provider profile, used in the FeaturedProfilesCarousel.
    - **Placement in Flow:** Within the FeaturedProfilesCarousel on the DiscoveryScreen.
    - **Layout & Key Elements:** Card with a background image and an elite badge.
- **ProviderPreviewView:**
    - **Component Type:** Composite Component
    - **Purpose:** To display a compact preview of a provider profile.
    - **Placement in Flow:** Used within the "Explore Hub / Playlists" section on the DiscoveryScreen.
    - **Layout & Key Elements:** Compact, typically square-shaped card with information overlaid on a background of the Provider's profile picture. Includes Online Status Indicator (top-right), Proximity Status Indicator (top-left if within 3km), and a bottom overlay with a horizontally scrolling row of top-leveled Skill Badges.
    - **User Actions / Interactivity:** Tapping anywhere on the card navigates to the Full Profile View.
    - **Design Philosophy:** Intentionally omits Provider name and numerical score to create intrigue and encourage taps based on visual brand, real-time relevance, and proven skills.
- **ServiceDetailPopup:**
    - **Component Type:** Composite Component / Modal
    - **Purpose:** To provide a rich, detailed description of a single service for confident booking decisions.
    - **Placement in Flow:** Presented as a pop-up modal from the Full Profile View when a service is tapped.
    - **Layout & Key Elements:** Scrollable view with Header (Service Name, Price, Duration, Close button), Service-Specific Gallery (horizontally scrolling photos), Tags (pill-shaped keywords), Rich Text Description (Provider's service explanation), and a sticky [ Book This Service ] button.
    - **User Actions / Interactivity:** Scroll vertically, swipe horizontally through gallery, tap [ Book This Service ] (closes modal, navigates to BookingScreen with service pre-selected), tap close button or outside modal (dismisses modal).
- **ServiceRequestForm:**
    - **Component Type:** Composite Component / Modal
    - **Purpose:** To capture unmet user demand by allowing a Looker to formally request a service not currently offered.
    - **Placement in Flow:** Presented as a pop-up modal from the ZeroResults screen when the [ + Request "[Service Name]" ] button is tapped.
    - **Layout & Key Elements:** Simple form with Header ("Request a New Service," subtitle), Form Fields (Service Name - pre-filled/editable, Your General Area - non-editable/pre-filled, Notes - optional multi-line text area), Notification Opt-In (checkbox - default checked), Action Button ([ Submit Request ]).
    - **User Actions / Interactivity:** Edit service name, type notes, toggle notification checkbox, tap [ Submit Request ] (sends data to server, appears in Provider 'Marketplace Requests', shows success pop-up, closes modal), tap close icon or outside modal (cancels).
    - **Technical Logic & Outcomes:** Submitting sends data to server, request is stored/aggregated, appears on relevant Provider dashboards, Looker sees success confirmation and modal closes.

### Full Screen / View Components:

- **AchievementsDashboardScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To provide a comprehensive, interactive dashboard of all available badges, showing the Provider their current progress towards each one, and giving clear, actionable instructions on how to unlock or upgrade them. It is a core feature for Provider engagement and professional growth.
    - **Placement in Flow:** Accessed by tapping the "View My Achievements Dashboard" button on the ProviderProfileScreen.
    - **Layout & Key Elements:**
        - The screen is organized with tabs to separate the different types of achievements, making it easy to navigate. The primary tabs are:
            1. [ Skill Badges ]
            2. [ Reputation & Milestones ]
        - **The "Skill Badges" Tab:** Displays a vertically scrolling list of all skills relevant to the Provider's category. Each skill is presented as a BadgeProgressCard.
        - **The "Reputation & Milestones" Tab:** Shows broader achievement badges related to professionalism and platform activity, also using the BadgeProgressCard format.
    - **BadgeProgressCard:**
        - **Purpose:** A reusable component to display individual achievement badges.
        - **Layout & Key Elements:**
            - **Badge Display:** Shows the badge icon and title, with its current achieved level visually represented.
            - **Progress Bar:** A prominent visual progress bar shows the Provider's progress towards the next level (not applicable for all badges, e.g., "Top Rated").
            - **Text Description (How to Upgrade):** Clear, dynamic text explains the exact criteria for the next level up.
- **AuthPage:**
    - **Component Type:** Full Screen / View (often presented as a pop-up modal)
    - **Purpose:** To handle the sign-up or login process after a user has identified as either a Looker or a Provider. Its appearance and subsequent action are configured based on the user's selected role.
    - **Placement in Flow:** Appears immediately after the RoleSelectionScreen for new users, or when a logged-out user taps the "Log In" link.
    - **Configurations:**
        - **Looker AuthScreen:**
            - **Trigger:** User has tapped "Book a Service."
            - **Design Philosophy:** Optimized for speed and minimum friction to get the Looker to the DiscoveryScreen quickly.
            - **Key Visual Elements:** Benefit-driven headline, prominent social login buttons (Google, Apple), less prominent email/password option, toggle to Log In.
            - **Next Step After Success:** Navigates to the DiscoveryScreen.
        - **Provider AuthScreen:**
            - **Trigger:** User has tapped "Provide a Service."
            - **Design Philosophy:** More formal and business-oriented to begin a professional relationship.
            - **Key Visual Elements:** Professional headline, prominent email/password form (Business Name, Email, Password), secondary social login buttons, toggle to Log In.
            - **Next Step After Success:** Navigates to the first step of the ProviderOnboardingWizard.
    - **Shared Functionality (Log In View):**
        - **Access:** Accessible from either the Looker or Provider sign-up forms.
        - **Layout:** Simple form with Email and Password fields, and a Log In button.
        - **Password Recovery:** "Forgot Password?" link navigates to a separate password reset screen.
- **BookingScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To allow a Looker to initiate a booking request by either selecting a standard service or sending a custom inquiry.
    - **Placement in Flow:** Accessed when a Looker taps a "Book" button from a ProviderDetailView.
    - **Layout & Key Elements:** Tabs/segmented control for "Choose From Menu" and "Send a Custom Request," and an interactive CalendarView.
    - **User Actions & Outcomes:** Supports two paths: selecting a service and requesting to book, or filling a custom request form and sending inquiry. Both paths trigger authentication if needed and lead to a pending booking status and a "Request Sent!" confirmation.
- **CalendarManagementScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To be the Provider's complete scheduling and booking management hub. Allows viewing the schedule in multiple formats, managing availability, and tracking appointment status.
    - **Placement in Flow:** Accessed via the [ Calendar ] icon in the Provider's main TabBar.
    - **Features & Functionality:**
        - **Views & Navigation:** Toggles for [ Day ], [ Week ] (Default), [ Month ], and [ List ] views.
        - **Event Display & Interaction (with Badges):** Appointments on calendar grid display small, color-coded Status Badges ([ Confirmed ], [ Pending ], [ Awaiting Payment ], [ Completed ], [ Cancelled ]). Tapping an event opens the BookingDetailPopup.
        - **The New "List View":** Provides a searchable and sortable list of all bookings. Includes a [ Sort By ▼ ] button and a vertically scrolling list of BookingListItem components. Tapping a list item opens the BookingDetailPopup.
        - **Managing Availability:** Supports setting Recurring Hours (via a separate screen) and making One-Off Changes by creating "Blocked Time" events via tapping-and-dragging on the calendar.
- **CardAuthorizationScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To securely obtain the Looker's payment details for booking reservation after Provider confirmation.
    - **Placement in Flow:** Presented when a Looker taps the [ Reserve with Card ] button on a booking with "Awaiting Reservation" status.
    - **Layout & Key Elements:** Headline, trust-building summary about the authorization hold, embedded secure Stripe form, and a [ Reserve My Spot ] button.
    - **User Actions & Outcomes:** Looker enters card details and taps the button. System authorizes the card via Stripe. Upon success, booking status becomes "Confirmed" and both users receive a confirmation.
- **ChatScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To allow a Looker and a Provider to communicate directly via text and images regarding a specific booking or inquiry. Serves as the primary communication channel.
    - **Placement in Flow:** Accessed by tapping on any ConversationListItem from the InboxScreen.
    - **Layout & Key Elements:** Header (other user's Avatar/Name, booking context), Chat Bubble Area (vertically scrolling history, styled bubbles with text/timestamp/read receipts), Text Input Area (multi-line input, Send button).
    - **Features & Functionality:** Image Sharing (+/paperclip icon), Quick Replies (for Providers, horizontally scrolling tappable buttons), System Messages (un-deletable automated message at thread start with booking details).
- **DiscoveryPage:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To act as the main "home" screen and discovery hub for Lookers. Supports both targeted search and inspiration-driven discovery.
    - **Placement in Flow:** Primary, default screen for any logged-in Looker.
    - **Layout & Key Elements (Top to Bottom):** Single, vertically scrolling page.
        - **Search Bar (Small):** Discreet search bar with placeholder text and Filter icon. Tapping initiates search flow.
        - **Featured Profiles (Medium):** Horizontally scrolling carousel titled "Featured This Week," displaying 3 Providers using the ProviderMediumView component.
        - **Card View (Large):** Primary interactive element: a large stack of profile cards using the ProviderLargeView (Tinder-style) component. Supports swipe left/right.
        - **Explore Hub / Playlists (Small):** Vertically scrolling section titled "More to Explore" with multiple horizontally scrolling playlists (carousels). Displays Providers using the ProviderPreviewView (compact with profile picture background and skill badges). Tapping any card navigates to the Full Profile View.
    - **User Actions / Interactivity:** Tap search bar, scroll horizontally through carousels, swipe Left/Right on Card View, tap any Provider card, scroll vertically.
- **FinalizePaymentScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To allow the Looker to complete the transaction by adding an optional tip and capturing final payment after service completion.
    - **Placement in Flow:** Presented to the Looker after a Provider marks their appointment as "Complete."
    - **Layout & Key Elements:** Summary of completed service and base price, Tipping Component (predefined percentages and custom amount), live-updating total, display of payment method, and a dynamic [ Pay €[Total Amount] & Leave Review ] button.
    - **User Actions & Outcomes:** Looker selects tip (or not), taps the pay button. System captures the final amount via Stripe from the authorized card.
    - **Upon successful payment, the Looker is navigated directly to the ReviewForm.**
- **Full Profile View (ProviderDetailView):**
    - **Component Type:** Full Screen / View
    - **Purpose:** To serve as the definitive "source of truth" and dashboard for a Provider, providing comprehensive information for Lookers to vet and book.
    - **Placement in Flow:** Final destination screen before booking, accessed by tapping a Provider from other views.
    - **Layout & Key Elements (Top to Bottom):** Rich, vertically scrolling screen.
        - **Header Section:** Provider's Avatar, Full Name, and OverallScoreDisplay (numerical score and total review count).
        - **Achievements & Verified Skills ("The Trophy Case"):** Prominent section displaying earned badges, including Reputation & Milestones (Elite badges) and Leveled Skill Badges (grid showing skill badges with level appearance).
        - **The Core Portfolio Gallery:** Unified "Portfolio & Recent Work" section with a dynamic grid combining Embedded Social Posts and Work from Reviews (verified looker photos).
        - **Services & Pricing:** Interactive list of services with name and starting price. Tapping opens ServiceDetailPopup (description, photo gallery, tags, "Book This Service" button).
        - **Provider Information:** Organized section with collapsible accordion items for About Me (Required) and Provider-Defined Sections (Optional).
        - **Full Reviews & Rating Breakdown:** Final section with RatingBreakdown component (average scores per category) and chronological list of text reviews.
    - **"Sticky" Element:** A "Book Now" Button remains visible at the bottom for easy access.
- **InboxScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To display a list of all conversations, allowing users to quickly see unread messages and navigate to a specific chat.
    - **Placement in Flow:** Accessed via the [ Inbox ] icon in the main TabBar.
    - **Layout & Key Elements:** Default chronological sorting, Search Bar, Filter Button (for unread messages), list of ConversationListItem components, and an Empty State message.
- **ProfileScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To be the Looker's personal hub for account management, activity tracking, achievements, favourite providers, and past bookings.
    - **Placement in Flow:** Accessed via the [ Profile ] icon in the Looker's main TabBar.
    - **Layout & Key Elements:** Header (Looker's Avatar/Name, "Edit Profile" button), Mini-Dashboard ("My Stats" with booked sessions, top category, amount spent), Gamification ("My Badges" carousel/grid), Management Lists (tappable links for My Favourite Providers and My Booking History), Account Settings (links for account settings, payment methods, notifications, and Log Out button).
- **ProviderDashboardPage:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To serve as the Provider's main business hub and strategic dashboard.
    - **Placement in Flow:** Default "home" screen for logged-in Providers.
    - **Layout & Key Elements (Top to Bottom):** Single, vertically scrolling view.
        - **"Action Required" Section:** "New Requests" title with notification badge. List of BookingRequestItem components (new booking requests/custom inquiries) with [ Confirm ]/[ Decline ] buttons.
        - **"Today's Schedule" Section:** Title "Today's Schedule: [Date]" with a chronological list of today's appointments.
        - **"Your Business Intelligence" Section:** Grid of stat cards (This Week's Earnings, Overall Score, Profile Views, Upcoming Appointments, Top Earner This Week, Most In-Demand Service).
        - **"Marketplace Requests" Section:** List of ServiceRequestItem components (open service requests from Lookers) with [ + Add to My Services ] action.
        - **"Looking Ahead" Section:** "Your Upcoming Schedule" title with a scrollable list of confirmed future appointments.
    - **Floating Action Button (FAB):** Round button with a + icon in the bottom-right, opening a menu with shortcuts ([ Block Time on Calendar ], [ Manage My Services ]).
    - **Main Navigation:** TabBar at the bottom with [ Dashboard ], [ Calendar ], [ Inbox ], and [ My Profile ] icons.
- **ProviderProfileScreen:**
    - **Component Type:** Full Screen / View
    - **Purpose:** To be the Provider's central "back office" for editing their public profile, managing services, and tracking achievements.
    - **Placement in Flow:** Accessed via the [ My Profile ] icon in the Provider's main TabBar.
    - **Layout & Key Elements:** Profile Preview Section (summary card, [ View My Public Profile ] button), My Achievements Summary (badge count, Elite badge, button to AchievementsDashboardScreen), Profile Customization Sections (tappable list items for editing personal info, managing services, custom info sections, portfolio), Business Settings (links for payout details, notifications, account info, and Log Out button).
- **ProviderOnboardingWizard:**
    - **Component Type:** System Feature / Multi-Step Flow
    - **Purpose:** To provide a guided, step-by-step process for new Providers to set up the essential components of their business profile.
    - **Placement in Flow:** Automatically begins immediately after a new Provider creates their account via the AuthScreen.
    - **Overall Structure & Style:** Full-screen modal/screens with a two-panel layout (dark Slate sidebar for progress, light Gray content panel for current step). Uses rounded-lg corners, soft shadows, and Lucide-react icons.
    - **The Wizard Steps:**
        - **Step 1: Sync Portfolio:** Headline ("Showcase Your Talent"), Body Text (explains syncing from social media), Visual Elements (clickable cards for Instagram/TikTok), Action Button ([ Next ] - disabled until account connected).
        - **Step 2: Sign Hygiene & Safety Pledge:** Headline ("Our Commitment to Safety"), Body Text (explains pledge), Visual Elements (scrollable pledge text, single checkbox), Action (checkbox must be checked for [ Next ] to become active).
        - **Step 3: Set Up Payouts:** Headline ("Get Paid Securely"), Body Text (explains Stripe integration), Visual Elements (card with Stripe logo and explanation), Action Button ([ Connect with Stripe ] - initiates Stripe onboarding flow, success message upon return).
        - **Step 4: Acknowledge Legal Terms:** Headline ("Final Step: Your Business, Your Terms"), Body Text (explains independent contractor status), Visual Elements (links to Terms of Service/Provider Agreement, final checkbox), Action (checkbox must be checked), Final Action Button ([ Finish & Go to Dashboard ] - closes wizard, navigates to ProviderDashboardScreen).

### System Components / Reusable Views:

- **ConnectivityStatus:**
    - **Component Type:** System Component / Reusable View
    - **Purpose:** To clearly inform the user when the app is offline and provide a path to resolution.
    - **Placement in Flow:** Can be displayed on any screen requiring a connection.
    - **Representations:**
        - **Full-Screen Message:** Used for initial loading failures. Full-screen view with no-connectivity icon, headline ("No Internet Connection"), body text, and [ Retry ] button.
        - **Toast / Snack Bar Notification:** Used when an action fails due to momentary connection loss. Small banner slides up with warning icon and concise message. Auto-dismisses.
- **OnboardingTour:**
    - **Component Type:** System Feature / Interactive Overlay
    - **Purpose:** To provide a guided, interactive walkthrough for new users to highlight key features and teach core actions.
    - **Placement in Flow / Trigger:**
        - **Lookers:** Triggers automatically the first time they land on the DiscoveryScreen after signup.
        - **Providers:** Triggers automatically the first time they land on their ProviderDashboardScreen after profile approval.
    - **Visual Style (Coach Marks):** Semi-transparent dark overlay, "spotlight" cutout highlighting one UI element, small pop-up box with explanatory text.
    - **User Actions / Interactivity:** Tap [ Next ], Tap [ Finish ]/[ Get Started! ] (on final step), Tap "Skip" (text link).
    - **Tour Steps (Looker - starts on DiscoveryScreen):** Step 1: Card View (Highlight main swipeable cards), Step 2: Explore Hub (Highlight playlists), Step 3: Profile Tab (Highlight [ Profile ] icon).
    - **Tour Steps (Provider - starts on ProviderDashboardScreen):** Step 1: Action Required Section (Highlight new requests), Step 2: Calendar Tab (Highlight [ Calendar ] icon), Step 3: Profile Tab (Highlight [ My Profile ] icon).

### User Flow: Authorize & Capture Payment Model

This section outlines the definitive user flow for booking and payment using the "Authorize & Capture" model.

1.  **Part 1: The Looker Initiates the Request:** Looker finds a Provider, selects a service, date, and time, then taps "Request to Book." Status becomes "Pending Provider Confirmation."
2.  **Part 2: The Provider Responds:** Provider receives the request, checks schedule, and taps "Confirm Booking."
3.  **Part 3: The Looker Secures the Reservation:**
    - Receives push notification about confirmation and prompt to add payment method.
    - Booking status updates to "Awaiting Reservation" with a [ Reserve with Card ] button.
    - Taps the button and is taken to the **CardAuthorizationScreen**.
    - Enters card details into the secure Stripe form and taps "Reserve My Spot."
    - Stripe verifies the card and places a €0 authorization hold. Booking status for both users updates to "Confirmed." Screen shows "Your appointment is reserved!" success message.
4.  **Part 4: Post-Appointment, Final Payment & Tipping:**
    - Provider marks the service as "Complete."
    - Looker receives a push notification to finalize payment and add a tip.
    - Looker opens the **FinalizePaymentScreen**.
    - Reviews booking summary, adds an optional tip (using predefined percentages or a custom amount).
    - Reviews the live-updating total amount and payment method.
    - Taps the dynamic [ Pay €[Total Amount] & Leave Review ] button.
    - System instructs Stripe to "capture" the final amount from the authorized card.
    - Upon successful payment, the Looker is navigated directly to the ReviewForm.

This flow provides a frictionless "book now, pay later" experience for Lookers and guarantees a payment method on file for Providers.

### Planned Components:

- Components related to the keyword system for services (e.g., a keyword input field, a search results display component).
- Components for managing reviews.

## Development Log

*   Initial React project setup (implied by existing codebase).
*   Firebase project initialization in the frontend (`/home/user/beauty-book-v2/src/main.tsx`).
*   Backend structure setup (`/home/user/beauty-book-v2/backend/functions` directory, `/home/user/beauty-book-v2/backend/functions/package.json`, `/home/user/beauty-book-v2/backend/functions/tsconfig.json`).
*   Implementation of initial Cloud Functions for Authentication (`registerUser`, `loginUser`) and User Management (`createUser`, `getUser`).
*   Deployment of Cloud Functions.
*   Initial setup of Firestore collections in the console (manual step).
*   Initial implementation of Firestore Security Rules (needs refinement).
*   Basic implementation and rendering test of `Button` and `InputField` atomic components in the frontend (`/home/user/beauty-book-v2/src/components/atomic/Button.tsx`, `/home/user/beauty-book-v2/src/components/atomic/InputField.tsx`, `/home/user/beauty-book-v2/src/App.tsx`).
*   Troubleshooting and resolving various configuration and syntax errors in both frontend and backend.

## Items Requiring Refinement

*   **Firestore Security Rules:** The current rules are a starting point and need to be refined based on detailed access control requirements (`/home/user/beauty-book-v2/firestore.rules.md`). This includes defining precise read/write conditions for each collection and potentially implementing role-based access control.
*   **Cloud Functions Logic:** The implemented functions (`registerUser`, `loginUser`, `createUser`, `getUser`) contain basic logic, but they might need further refinement based on your specific data models, error handling requirements (`/home/user/beauty-book-v2/error-handling.md`), and security best practices (e.g., input validation, data sanitization).
*   **Frontend Atomic Component Styling and Accessibility:** The `Button` and `InputField` components have basic structure. They need to be styled according to your visual design principles (`/home/user/beauty-book-v2/styling.md`) and enhanced with accessibility features (`/home/user/beauty-book-v2/accessibility.md`).
*   **Comprehensive Error Handling:** While we've included basic error handling in the functions, a more comprehensive error handling strategy throughout the application (frontend and backend) based on `/home/user/beauty-book-v2/error-handling.md` is needed.
*   **Input Validation:** Robust input validation is needed in both the frontend and backend to ensure data integrity and security.
*   **Frontend State Management:** As the application grows, a state management solution will be needed to manage application-wide state (e.g., user authentication status, user profile data, booking information).
*   **Integration of Frontend and Backend:** Connecting the frontend components to the deployed backend functions is a major upcoming task.