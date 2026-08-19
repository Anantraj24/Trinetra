# UI System & Design Language

## Visual Language
- **Theme**: Premium warm ivory, sand, and taupe. 
- **Surfaces**: Large rounded cards, layered translucent surfaces (used sparingly), minimal borders, soft shadows.
- **Responsiveness**: Mobile-first approach. Desktop layouts are restricted by `max-w-md` or `max-w-xl` central columns to avoid the "stretched phone" look, or intelligently split into multi-column layouts for Authorities.

## Tailwind Configuration (Proposed)
```js
theme: {
  colors: {
    ivory: { DEFAULT: '#FAFAFA', warm: '#F5F2EB' },
    sand: { light: '#E8E3D9', DEFAULT: '#D6CFC4', dark: '#B5AA9B' },
    taupe: { DEFAULT: '#8B8178', dark: '#5E564F' },
    alert: { DEFAULT: '#D9534F', soft: '#F9EAE8' },
    success: { DEFAULT: '#5CB85C', soft: '#EBF7EB' }
  },
  borderRadius: {
    'xl': '1rem',
    '2xl': '1.5rem',
    '3xl': '2rem'
  }
}
```

## Component Guidelines
1. **Cards**: `bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-sand-light`
2. **Buttons**: 
   - Primary: `bg-taupe-dark text-white rounded-full py-3 px-6 transition-all active:scale-95`
   - Secondary: `bg-sand-light text-taupe-dark rounded-full py-3 px-6 transition-all active:scale-95`
3. **Typography**: High contrast text (`text-taupe-dark` for headings, `text-taupe` for body). Avoid light grays that fail WCAG guidelines.

## Interactions
- Use CSS transitions for state changes (`hover:`, `focus:`, `active:`). No heavy animation libraries.
- Loading states: Soft pulsing skeletons matching the sand/ivory palette.
