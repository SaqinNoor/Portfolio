# Saqin Noor - Portfolio

A digital archive of development, leadership, and achievements.

Live Site: https://saqinnoor.vercel.app

## Overview

A portfolio website designed with a monochromatic aesthetic, incorporating elements of brutalism and glassmorphism. It focuses on fluid interactions and high performance without relying on heavy frontend frameworks.

## Technologies

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: Vite
- **Animation**: GSAP
- **Scroll Engine**: Lenis

## Key Features

- **Custom Loader**: A startup sequence with text scramble effects.
- **Interactive Photo Gallery**: A stacked card layout that expands into a full-screen, justified flexbox grid. The layout automatically calculates and preserves the exact aspect ratios of all photographs.
- **Magnetic Cursor**: Custom cursor interactions that apply magnetic pulling effects to specific interface elements.
- **Responsive Design**: Adapts across all device sizes using CSS Grid and Flexbox.

## Development Setup

### Prerequisites
- Node.js and pnpm
- uv (for running Python utilities)

### Instructions

1. Install Node dependencies:
   ```bash
   pnpm install
   ```

2. Start the local development server:
   ```bash
   pnpm run dev
   ```

3. Build for production:
   ```bash
   pnpm run build
   ```

### Image Optimization

The project includes Python utilities to automate image optimization. These scripts convert unoptimized images to WebP format, update references and apply appropriate loading attributes to HTML tags.

To run the utilities:
```bash
uv run convert_to_webp.py
uv run update_references.py
```

---
Copyright 2026 Saqin Noor.
