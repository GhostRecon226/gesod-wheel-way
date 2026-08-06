# Navbar simplification

## Goal
Clean up the navigation by adding a visible "Home" link and removing the redundant "Get a Quote" nav button (the hero already provides it).

## Changes

### `src/components/Navbar.tsx`
1. Add a top-level `Home` link to the `navItems` array (`{ label: "Home", to: "/" }`), so it appears as the first desktop and mobile menu item.
2. Remove the desktop "Get a Quote" outline button from the right-side button group (keep only the "Login" button).
3. Remove the mobile "Get a Quote" button from the bottom of the mobile drawer (keep only the "Login" button).

## Result
- Navigation reads: Home, Services, Auctions, Track, Company.
- Only one CTA button remains in the navbar: Login.
- "Get a Quote" stays accessible via the hero section and other page CTAs.
