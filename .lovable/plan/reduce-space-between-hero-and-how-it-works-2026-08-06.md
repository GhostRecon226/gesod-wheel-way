# Reduce Space Between Hero and "How It Works"

## Goal
Move the "How It Works" section closer to the hero section on the home page by reducing the vertical spacing between them.

## Current State
- In `src/pages/Index.tsx`, the Hero section ends and the "How It Works" section immediately follows.
- The "How It Works" section uses `py-20` (top and bottom padding), which creates a large 80px gap below the hero.

## Change
Update the "How It Works" `<section>` class from `py-20` to `pt-8 pb-20` (or a similarly reduced top padding) to tighten the space between the two sections while keeping the bottom spacing consistent with the rest of the page.

## Verification
Visually confirm in the preview that the "How It Works" heading now sits closer to the hero section without feeling cramped.