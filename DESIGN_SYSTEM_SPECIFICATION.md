# LATAP Design System Specification

**Version:** 2.0.0  
**Date:** 2026-01-17  
**Status:** MASTER DESIGN CONTRACT

---

## Master UI/UX & Motion Design Philosophy

### ROLE
Senior Product Designer + Motion Engineer for Enterprise SaaS Platform.

LATAP must feel:
- **Trustworthy** - Like LinkedIn, Stripe Dashboard, Atlassian
- **Premium** - Enterprise-grade, not startup demo
- **Calm** - Backgrounds don't compete for attention
- **Powerful** - Data-rich, functional
- **Effortless** - Predictable, consistent patterns

**NOT**: Flashy, playful, "startup-demo-like"

---

## CORE DESIGN PRINCIPLES

### 1. Visual Hierarchy > Decoration

Every screen must clearly answer:
- **Primary action** (1)
- **Secondary actions** (2–3)  
- **Contextual information** (background)

Use: Spacing, Weight, Alignment, Color restraint
**Never use color just for beauty — only for meaning.**

### 2. Color System

- **Primary**: Navy / Deep Blue (Trust, Authority)
- **Surface**: Off-white / Light grey  
- **Accent**: One controlled highlight color only (for CTA)

**Rules:**
- No gradients unless extremely subtle
- No neon, no excessive glass blur
- Backgrounds must be calm, not attention-seeking

### 3. Typography

- Large, clean, neutral sans-serif
- Strong contrast between: Headings, Body, Metadata
- Must feel: Corporate, Legible, Dense but not cramped
- **Avoid playful fonts entirely**

### 4. Layout Rhythm

- Consistent vertical spacing
- Grid-aligned cards
- Predictable margins
- No "floating" elements without anchoring
- **Nothing should feel randomly placed**

---

## MOTION & ANIMATION PHILOSOPHY

**Rule Zero: Animation must reduce cognitive friction, not show off.**

### 1. When to Animate
Only animate to:
- Indicate state change
- Guide attention  
- Provide feedback
- Preserve context during transitions

**Never animate for decoration.**

### 2. How Animations Should Feel

- **Duration**: 150–300ms
- **Easing**: ease-out / cubic-bezier(0.2, 0.8, 0.2, 1)
- **No bounce, overshoot, or elastic effects**

Motion must feel: Heavy, Stable, Controlled
**Like enterprise software, not game UI.**

### 3. Micro-interactions

- **Buttons**: slight elevation + shadow on hover
- **Inputs**: border + glow change on focus  
- **Cards**: minimal translateY(2–4px) on hover
- **Loading**: subtle shimmer/skeleton, not spinners everywhere

### 4. Page Transitions

- Fade + slight vertical shift (8–12px)
- No sliding panels
- No dramatic transitions
- **User must never feel "lost"**

---

## UX BEHAVIOR

### 1. Predictability
- Same action = same placement everywhere
- Same error = same pattern everywhere  
- Same success = same feedback everywhere
- **Consistency builds trust more than beauty**

### 2. Feedback System
Every action must have:
- Loading state
- Success confirmation
- Error explanation (human-readable)
- **No silent actions**

### 3. Information Density
Professional apps are:
- Data-rich
- Not empty
- Not oversized
- **Avoid large empty hero sections in internal pages**

---

## WHAT TO AVOID (CRITICAL)

❌ Excessive gradients
❌ Glass everywhere  
❌ Constant motion
❌ Fancy but meaningless animations
❌ Over-rounded corners
❌ "Landing-page" aesthetics inside product pages
❌ Large glowing buttons everywhere

**These scream: "Demo product."**

---

## SUCCESS CRITERIA

After applying this philosophy, LATAP should feel like:
✅ **LinkedIn**
✅ **Stripe Dashboard** 
✅ **Atlassian Admin**
✅ **Enterprise SaaS**

**NOT like:**
❌ Dribbble demo
❌ Startup landing page  
❌ AI template

**Users should subconsciously think: "This feels serious. I can trust this."**

---

## FOOTER REQUIREMENTS

### Copyright Notice
Every webpage must include at the bottom:
```
© 2026 Infinitra Innovations. All rights reserved.
```

**Implementation:**
- Position: Bottom of every page
- Style: Small, muted text (var(--text-muted))
- Alignment: Center or left-aligned with content
- Consistent across all pages like professional enterprise sites

---

## Color System

### Foundation Colors
```css
/* Deep Navy - Primary Brand */
--navy-950: #0c1220  /* Darkest - headers, emphasis */
--navy-900: #0f172a  /* Primary text, buttons */
--navy-800: #1e293b  /* Hover states */
--navy-700: #334155  /* Secondary text */
--navy-600: #475569  /* Borders, dividers */
--navy-500: #64748b  /* Muted text */

/* Surface Colors - Backgrounds */
--white: #ffffff     /* Cards, modals */
--surface-50: #f8fafc   /* Page backgrounds */
--surface-100: #f1f5f9  /* Subtle backgrounds */
--surface-200: #e2e8f0  /* Borders */
--surface-300: #cbd5e1  /* Dividers */
```

### Accent Colors
```css
/* Blue Accent - Interactive Elements */
--accent-50: #eff6ff   /* Light backgrounds */
--accent-100: #dbeafe  /* Hover backgrounds */
--accent-500: #3b82f6  /* Primary actions */
--accent-600: #2563eb  /* Button default */
--accent-700: #1d4ed8  /* Button hover */
```

### Status Colors
```css
/* Success - Green */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* Warning - Amber */
--warning-50: #fffbeb
--warning-500: #f59e0b

/* Error - Red */
--error-50: #fef2f2
--error-500: #ef4444
```

### Text Hierarchy
```css
--text-primary: #0f172a    /* Main headings, important text */
--text-secondary: #334155  /* Body text, descriptions */
--text-muted: #64748b      /* Helper text, labels */
--text-subtle: #94a3b8     /* Placeholder text, disabled */
```

---

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Fallback**: -apple-system, BlinkMacSystemFont, sans-serif

### Type Scale
```css
.text-xs    { font-size: 0.75rem; line-height: 1rem; }     /* 12px */
.text-sm    { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base  { font-size: 1rem; line-height: 1.5rem; }      /* 16px */
.text-lg    { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl    { font-size: 1.25rem; line-height: 1.75rem; }  /* 20px */
.text-2xl   { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl   { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl   { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */
```

### Usage Guidelines
- **Headings**: Use navy-900 color, semibold or bold weight
- **Body Text**: Use text-secondary color, regular weight
- **Helper Text**: Use text-muted color, regular weight
- **Disabled Text**: Use text-subtle color

---

## Layout System

### Container Sizes
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
```

### Section Spacing
```css
.section     { padding: 3rem 0; }  /* Default */
.section-sm  { padding: 2rem 0; }  /* Compact */
.section-lg  { padding: 4rem 0; }  /* Spacious */
```

### Grid System
```css
.grid    { display: grid; gap: 1.5rem; }
.grid-2  { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3  { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.grid-4  { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

---

## Component System

### Cards
```css
/* Base Card */
.card {
  background: var(--white);
  border-radius: var(--radius-lg);
  border: var(--border-subtle);
  transition: all var(--transition-medium);
  color: var(--navy-900);
}

/* Card Variants */
.card-elevated {
  box-shadow: var(--shadow-sm);
}

.card-elevated:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.card-floating {
  box-shadow: var(--shadow-lg);
  border: none;
}

/* Card Padding */
.card-body    { padding: 1.5rem; }
.card-body-lg { padding: 2rem; }
.card-body-xl { padding: 3rem; }
```

### Buttons
```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

/* Button Sizes */
.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 0.875rem 1.75rem; font-size: 1rem; }

/* Button Variants */
.btn-primary {
  background: var(--navy-900);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-secondary {
  background: var(--white);
  color: var(--navy-900);
  border: var(--border-subtle);
}

.btn-accent {
  background: var(--accent-600);
  color: var(--white);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
```

### Form Elements
```css
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  border: var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--white);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-500);
  box-shadow: 0 0 0 3px var(--accent-50);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
```

### Status Badges
```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-verified {
  background: var(--success-50);
  color: var(--success-600);
  border: 1px solid var(--success-500);
}

.status-pending {
  background: var(--warning-50);
  color: var(--warning-500);
  border: 1px solid var(--warning-500);
}

.status-rejected {
  background: var(--error-50);
  color: var(--error-500);
  border: 1px solid var(--error-500);
}
```

---

## Shadows & Elevation

### Shadow Scale
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Usage Guidelines
- **Cards**: shadow-sm (default), shadow-md (hover)
- **Modals**: shadow-xl
- **Buttons**: shadow-sm (default), shadow-md (hover)
- **Dropdowns**: shadow-lg

---

## Border Radius

```css
--radius-sm: 0.375rem;  /* 6px - Small elements */
--radius-md: 0.5rem;    /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - Cards */
--radius-xl: 1rem;      /* 16px - Large containers */
```

---

## Transitions & Animations

### Timing Functions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-medium: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Animation Classes
```css
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-slide-in-right {
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## Navigation System

### Primary Navigation
```css
.nav-primary {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  cursor: pointer;
}

.nav-brand:hover {
  text-decoration: none;
}

.nav-logo {
  width: 2rem;
  height: 2rem;
  background: var(--navy-900);
  border-radius: var(--radius-md);
  color: var(--white);
  font-weight: 600;
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.nav-brand:hover .nav-logo {
  background: var(--navy-800);
  transform: scale(1.05);
}

.nav-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.nav-brand:hover .nav-title {
  color: var(--navy-800);
}

.nav-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: -0.125rem;
}
```

### Navigation Usage
**Standard Header Structure:**
```html
<header class="nav-primary">
  <div class="nav-container">
    <a href="/" class="nav-brand">
      <div class="nav-logo">L</div>
      <div>
        <div class="nav-title">LATAP</div>
        <div class="nav-subtitle">Alumni Talent Network</div>
      </div>
    </a>
    <div class="nav-actions">
      <!-- Navigation buttons/menu -->
    </div>
  </div>
</header>
```

**Requirements:**
- Every page MUST include the LATAP header
- Logo "L" in navy square with white text
- Clicking anywhere on brand area redirects to home page (/)
- Hover effects: logo scales 1.05x, background darkens
- Subtitle: "Alumni Talent Network"

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
@media (max-width: 768px) {
  .container { padding: 0 1rem; }
  .section { padding: 2rem 0; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1025px) {
  /* Desktop styles - default */
}
```

---

## Accessibility Standards

### Color Contrast
- **Text on White**: Minimum 4.5:1 ratio (WCAG AA)
- **Large Text**: Minimum 3:1 ratio
- **Interactive Elements**: Clear focus states with 3px outline

### Focus States
```css
.btn:focus,
.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-50);
}
```

### Screen Reader Support
- Use semantic HTML elements
- Provide ARIA labels for complex interactions
- Ensure logical tab order

---

## Usage Guidelines

### Do's ✅
- Use the defined color variables consistently
- Maintain proper text contrast ratios
- Apply consistent spacing using the grid system
- Use semantic HTML elements
- Implement smooth transitions for interactions

### Don'ts ❌
- Don't use hardcoded color values
- Don't mix different shadow styles on the same page
- Don't skip focus states for interactive elements
- Don't use colors alone to convey information
- Don't create custom components without following the system

---

## Component Examples

### Opportunity Card
```html
<div class="card card-elevated">
  <div class="card-body">
    <h3 class="text-lg font-semibold text-primary">Software Engineer</h3>
    <p class="text-sm text-secondary">TechCorp Inc.</p>
    <div class="status-badge status-verified">Active</div>
  </div>
</div>
```

### Primary Button
```html
<button class="btn btn-primary btn-lg">
  Apply Now
</button>
```

### Form Input
```html
<div class="form-group">
  <label class="form-label required">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter your email">
  <p class="form-helper">We'll never share your email</p>
</div>
```

---

## Implementation Notes

### CSS Custom Properties
All design tokens are implemented as CSS custom properties in `app/globals.css`. This allows for:
- Consistent theming across components
- Easy maintenance and updates
- Runtime theme switching (future enhancement)

### Tailwind CSS Integration
The design system works alongside Tailwind CSS classes. Use:
- Design system classes for branded components
- Tailwind utilities for layout and spacing
- Custom properties for colors and shadows

### Component Library
Each component should:
- Follow the design system specifications
- Include proper TypeScript types
- Support all defined variants
- Include accessibility features
- Have consistent naming conventions

---

## Maintenance

### Version Control
- Update version number for any breaking changes
- Document all changes in component changelog
- Test changes across all pages before deployment

### Quality Assurance
- Visual regression testing for design changes
- Accessibility audit for new components
- Cross-browser compatibility testing
- Mobile responsiveness verification

---

**This design system ensures LATAP maintains a professional, consistent, and accessible user interface across all pages and components.**

**Version:** 1.0.0  
**Last Updated:** 2026-01-17  
**Next Review:** 2026-02-17

---

## SIGNATURE UI/UX & MOTION SYSTEM

### FLAGSHIP PRODUCT PHILOSOPHY

**Goal**: Make LATAP visually memorable, emotionally engaging, trust-inducing, and premium-feeling WITHOUT becoming playful, childish, or decorative.

**Core Principle**: Structure is professional. Expression is distinctive.

### LAYOUT PHILOSOPHY

#### 1. Break the Card Monotony
- **NO** identical card grids everywhere
- **USE**: Asymmetric sections, highlight panels, split layouts, data strips, vertical rhythm changes

**Example Layout Pattern**:
- One dominant information column (8/12 grid)
- One contextual insight rail (4/12 grid)  
- One action rail (horizontal)

#### 2. Hierarchy Through Scale, Not Boxes
- Use typography scale, white space, section separation
- **NOT** excessive borders around everything
- Only critical elements get containment

### SIGNATURE MOTION SYSTEM

#### Motion Style
- **Directional, not ornamental**
- Elements flow into place, reveal progressively, respond with weight
- **NO** bounce, toy physics

**Use**:
- Staggered entrance for grouped elements
- Subtle parallax on major sections  
- Magnetic CTAs with pull effect
- Hover depth with layered shadows

#### Interaction Feedback
- Buttons feel "pressable"
- Cards feel "liftable" 
- Panels feel "slidable"
- Every interaction should feel physical

### VISUAL DIFFERENTIATION TECHNIQUES

To avoid AI sameness:
- Alternate section shapes (not just rectangles)
- Use horizontal separators, not only boxes
- Mix column-based and flow-based layouts
- Use vertical data timelines instead of grids
- Use side panels for context instead of more cards

### ANIMATION RULES

**Use animation to**:
- Guide focus
- Show causality  
- Create progression
- **NOT** to decorate

**Technical Specs**:
- Durations: 200–400ms
- Easing: custom cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Combine: Opacity + position
- Scale only for emphasis, not all elements

### EMOTIONAL GOAL

User should feel: *"This platform is alive, serious, and powerful."*
**NOT**: *"This is a nice-looking website."*

### IMPLEMENTATION EXAMPLE

```typescript
// Signature Motion Pattern
const sectionVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] // Custom signature easing
    }
  }
};

// Magnetic CTA Effect
whileHover={{ 
  scale: 1.02,
  boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
  transition: { duration: 0.2 }
}}
```

### LAYOUT PATTERNS

```jsx
// Asymmetric Header Layout
<div className="grid grid-cols-12 gap-8">
  <div className="col-span-8">{/* Dominant content */}</div>
  <div className="col-span-4">{/* Contextual rail */}</div>
</div>

// Vertical Timeline (not card grid)
<div className="relative">
  <div className="absolute left-8 top-0 bottom-0 w-px bg-surface-200"></div>
  {/* Timeline items */}
</div>
```

**This signature system eliminates generic AI patterns and creates a distinctive, premium enterprise product feel.**

---

## MANDATORY IMPLEMENTATION FOR ALL PAGES

### EVERY NEW PAGE MUST INCLUDE

#### 1. Signature Layout Structure
```jsx
// Required: Asymmetric header for all internal pages
<div className="grid grid-cols-12 gap-8 mb-12">
  <div className="col-span-8">
    {/* Dominant information column */}
    <div className="inline-flex items-center gap-3 mb-4">
      <div className="w-2 h-8 bg-accent-500 rounded-full"></div>
      <span className="text-sm font-medium uppercase tracking-wide">SECTION NAME</span>
    </div>
    <h1 className="text-4xl font-semibold leading-tight mb-4">Page Title</h1>
    <p className="text-lg leading-relaxed">Description</p>
  </div>
  <div className="col-span-4">
    {/* Contextual insight rail */}
    <div className="bg-white rounded-lg border border-surface-200 p-6">
      {/* Metrics, status, or contextual info */}
    </div>
  </div>
</div>
```

#### 2. Signature Motion Patterns
```typescript
// Required: Standard animation variants for all pages
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

const sectionVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] // Signature easing
    }
  }
};
```

#### 3. Magnetic CTA Implementation
```jsx
// Required: All primary buttons must use magnetic effect
<motion.button
  className="btn btn-primary px-8 py-3"
  whileHover={{ 
    scale: 1.02,
    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
    transition: { duration: 0.2 }
  }}
  whileTap={{ scale: 0.98 }}
>
  Action Text
</motion.button>
```

#### 4. Timeline/List Layouts
```jsx
// Required: Use timeline pattern instead of card grids for sequential content
<div className="relative">
  <div className="absolute left-8 top-0 bottom-0 w-px bg-surface-200"></div>
  <div className="space-y-6">
    {items.map((item, index) => (
      <motion.div
        key={item.id}
        className="relative ml-16"
        initial={{ x: -20, opacity: 0 }}
        animate={{ 
          x: 0, opacity: 1,
          transition: { delay: index * 0.1, duration: 0.4 }
        }}
      >
        <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-accent-500"></div>
        {/* Content */}
      </motion.div>
    ))}
  </div>
</div>
```

#### 5. Data Strips Pattern
```jsx
// Required: Use data strips for metadata instead of scattered text
<div className="flex items-center gap-8 pt-4 border-t border-surface-100">
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-success-500"></div>
    <span className="text-sm">Status Info</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-accent-500"></div>
    <span className="text-sm">Additional Info</span>
  </div>
</div>
```

#### 6. Progressive Disclosure
```jsx
// Required: Use progressive reveal for conditional content
{selectedItem && (
  <motion.div 
    className="mt-8 p-6 rounded-lg"
    style={{ 
      background: 'linear-gradient(135deg, var(--accent-50) 0%, var(--surface-50) 100%)',
      border: '1px solid var(--accent-200)'
    }}
    initial={{ opacity: 0, y: 20, height: 0 }}
    animate={{ 
      opacity: 1, y: 0, height: 'auto',
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }}
  >
    {/* Revealed content */}
  </motion.div>
)}
```

#### 7. Copyright Footer (Mandatory)
```jsx
// Required: Every page must end with this footer
<footer className="mt-16 py-8 text-center">
  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
    © 2026 Infinitra Innovations. All rights reserved.
  </p>
</footer>
```

### FORBIDDEN PATTERNS

❌ **Never Use**:
- Identical card grids
- Generic template layouts  
- Default easing curves
- Scattered metadata
- Empty hero sections in internal pages
- Decorative animations

✅ **Always Use**:
- Asymmetric layouts
- Timeline patterns
- Signature motion system
- Data strips
- Progressive disclosure
- Magnetic interactions

### SUCCESS CRITERIA FOR NEW PAGES

Every new page must pass this checklist:
- [ ] Uses asymmetric header layout (8/12 + 4/12)
- [ ] Implements signature motion patterns
- [ ] Has magnetic CTA effects
- [ ] Uses timeline/data strip patterns
- [ ] Includes progressive disclosure
- [ ] Has copyright footer
- [ ] Feels distinctive, not template-like

**This is the mandatory implementation standard for all future LATAP pages.**

---

## DARK MODE SYSTEM

### THEME TOGGLE REQUIREMENTS

#### Consistent Positioning
- **Fixed position**: `top: 1rem; right: 1rem`
- **Z-index**: 1000 (above all content)
- **Same position on every page** - no exceptions

#### Implementation
```jsx
// Required: Theme toggle must be in root layout
import { ThemeProvider } from './contexts/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

// Wrap entire app
<ThemeProvider>
  <ThemeToggle />
  {children}
</ThemeProvider>
```

#### Dark Mode Color Mapping
```css
/* Light Mode (Default) */
:root {
  --surface-50: #f8fafc;    /* Page backgrounds */
  --white: #ffffff;         /* Card backgrounds */
  --text-primary: #0f172a;  /* Main text */
  --accent-500: #3b82f6;    /* Primary actions */
}

/* Dark Mode */
[data-theme="dark"] {
  --surface-50: #0c1220;    /* Dark page backgrounds */
  --white: #0f172a;         /* Dark card backgrounds */
  --text-primary: #f8fafc;  /* Light text */
  --accent-500: #60a5fa;    /* Brighter accent for contrast */
}
```

#### Smooth Transitions
- All elements transition colors smoothly (0.3s ease)
- Theme toggle has spring animation
- No jarring color switches

#### Usage Guidelines
- **Always use CSS variables** - never hardcoded colors
- **Test both themes** for every new component
- **Maintain contrast ratios** in both modes
- **Icons/emojis** should work in both themes

### MANDATORY FOR ALL PAGES
- Theme toggle appears in same position
- All colors use CSS variables
- Smooth theme transitions
- Both themes tested and functional

**Dark mode is now a core requirement for the LATAP design system.**
