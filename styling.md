# Styling Guide

This document outlines the styling approach and visual design principles for the application.

## Styling Approach

*   **Primary Solution:** Tailwind CSS will be used as the primary styling solution.
    *   **Integration:** Tailwind CSS, PostCSS, and Autoprefixer will be installed and configured. The `tailwind.config.js` file will be used to customize the default theme with our specific design tokens.
    *   **Application:** Styles will be applied using Tailwind's utility classes directly in JSX/TSX.
    *   **Customization:** `@apply` directives or custom component classes will be used for reusable style patterns. The `tailwind.config.js` file will be used for theming and managing custom styles.
*   **Alternative (Optional):** CSS Modules may be used alongside Tailwind CSS for specific component-level styles if necessary.

## Visual Design Principles (Inspired by Just Eat & Marine Life Theme)

*   **Overall Aesthetics:** Modern, visually appealing, and intuitive user experience.
    *   Modern Components
    *   Balanced Layout
    *   Polished Styles
    *   **Overall Aesthetic:** clean, professional, and user-centric. Balances a minimalist foundation with vibrant accents and high-quality imagery. Designed for a service-based marketplace.
*   **Bold Definition:** Incorporating modern, interactive elements.
    *   **Fonts:** Expressive and relevant typography, with varied font sizes for emphasis.
    *   **Color:** A wide range of color concentrations and hues for a vibrant and energetic palette, inspired by Just Eat's approach and the marine life theme (including shades of blue, green, orange, white, black, and grey).
    *   **Color Palette:** Simple but effective, creating a clear visual hierarchy.
        *   **Background:** Very light, soft gray (like `#F9F9F9` or `#F5F5F7`).
        *   **Primary Accent:** Vibrant, warm coral-red (approximately `#E64B4B`) for primary CTAs, active states, toggles, and important notifications.
        *   **Text:** Dark charcoal or off-black (like `#212121`) for main text.
        *   **Secondary UI Elements:** Various shades of gray for secondary text, icons, borders, and disabled states.
        *   **Highlights:** Soft blue for selection highlights (e.g., calendar date), muted green/teal for positive states (e.g., "Available" checkbox).
    *   **Texture:** Subtle noise texture on the main background for a premium feel.
    *   **Typography:** Clean, legible, modern, geometric sans-serif font (e.g., **Inter**, **Poppins**, or **Manrope**). Strong and clear typographic scale:
        *   **Screen Titles:** Large size, bold weight.
        *   **Section Headers:** Medium size, bold weight.
        *   **Body & Item Text:** Regular weight, standard size.
        *   **Secondary Info:** Smaller size, regular or medium weight, often lighter gray.
    *   **Visual Effects:** Multi-layered drop shadows for depth (especially on cards).
    *   **Visual Effects:**
        *   **Drop Shadows:** Subtle, multi-layered drop shadows for cards to create depth and make them appear "lifted."
        *   **Glow Effect:** Shadows with elegant color usage to create a "glow" effect for interactive elements (buttons, checkboxes, etc.).
    *   **Iconography:** Using icons (e.g., Lucide-react) to enhance understanding and navigation.
    *   **Interactivity:** Shadows with elegant color usage to create a "glow" effect for interactive elements.

## Project-Specific Styling Considerations

*   **Marine Life Theme Integration:**
    *   Color palette incorporating shades of blue and green.
    *   Subtle background textures or patterns evoking water or marine elements.
    *   Potential use of marine motifs in iconography.
*   **Target Audience (Casual Game Players):** Design should be fun, engaging, and visually appealing.

## Implementation Details

*   **Layout & Structure:**
    *   **Card-Based Design:** Core organizing principle. Content in cards with rounded corners (approx. 8-16px radius) and subtle drop shadow.
    *   **Whitespace:** Generous padding inside cards and margins between elements.
    *   **Alignment:** Strict grid system.
    *   **Navigation (Mobile):** Standard bottom tab bar for primary, top navigation bar for secondary (title, back buttons, contextual icons).

*   **Key UI Components & Elements:**
    *   **Buttons:** Primary CTA (solid fill, coral-red, white text, rounded corners), Icon Buttons (circular, simple icon, secondary actions).
    *   **Forms & Inputs:** Minimalist, clear labels above fields. Toggles are simple switches, adopt accent color when active.
    *   **Icons:** Lightweight, minimalist, consistent outline-style set.
    *   **Imagery:** High-quality, professional photography crucial.
    *   **Data Visualization:** Simple, clean bar chart with rounded tops for reports.

*   **Spacing:** Implement a consistent spacing scale using Tailwind's configuration (e.g., based on multiples of 4px or 8px).

*   **Responsiveness:** Card grids stack into a single column on mobile. Maintain generous whitespace. Use subtle hover effects for interactivity on desktop.