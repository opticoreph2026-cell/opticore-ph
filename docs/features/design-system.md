# Premium Obsidian Design System

OptiCore uses a state-of-the-art **Premium Obsidian** design language, combining high-fidelity aesthetics with clinical precision.

## Design Philosophy
- **Obsidian Foundation**: A base palette of ultra-deep blacks (`#020204`) and charcoal surfaces, providing a futuristic, "command center" feel.
- **Glassmorphism**: Use of `backdrop-blur-xl` and semi-transparent layers to create depth and hierarchy without clutter.
- **Energy Accents**: High-vibrancy cyan and purple accents represent electrical and water resources.

## Key UI Components
- **Spotlight Cards**: Interactive elements that react to mouse position with a subtle energy glow.
- **Mesh Gradients**: Ambient, animated backgrounds that add professional texture.
- **Bento Grids**: Structured, modular layouts that adapt perfectly to different screen sizes.
- **Physics-Based Motion**: Uses `framer-motion` for transitions that feel heavy and intentional.

## Deep Analysis & Debugging
### Implementation (Frontend)
- **Token Consistency**: All colors are synchronized between `globals.css` (variables) and `tailwind.config.js` (theme tokens).
- **Animation Strategy**: Staggered entry animations are used in every main dashboard view to prevent visual overwhelm.

### Design Audit
- **Redundancy Cleanup**: Systematically removed duplicate titles and navigation labels to ensure a "Minimum Effective UI" that maximizes data density.
- **Responsive Hardening**: Every component uses a mobile-first fluid layout with custom breakpoints for ultra-wide displays.

### Technical Debugging
- **Build Optimization**: Added missing `surface-1000` tokens to the Tailwind config, resolving multiple CSS compilation warnings.
