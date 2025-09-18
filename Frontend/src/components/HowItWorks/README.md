# How It Works Component

A responsive React component for the "How it works" section featuring smooth scroll-linked animations, card snapping, and comprehensive accessibility support.

## Features

- **Sticky Viewport Container**: Cards snap to center as user scrolls
- **Smooth Scrolling**: Powered by Lenis for inertial scrolling
- **Scroll-linked Animations**: Framer Motion with useScroll/useTransform
- **Card Animations**: Scale, translate, blur, and shadow effects
- **Keyboard Navigation**: Arrow keys, space bar, Home, End
- **Touch Support**: Swipe gestures for mobile devices
- **Accessibility**: ARIA labels, focus management, reduced motion support
- **Performance Optimized**: GPU transforms, will-change, throttled animations

## Installation

The component requires the following dependencies (already installed in this project):

```bash
npm install @studio-freight/lenis framer-motion
```

## Usage

### Basic Import

```jsx
import HowItWorks from './components/HowItWorks';

function App() {
  return (
    <div>
      <HowItWorks />
    </div>
  );
}
```

### Integration in About Page

```jsx
import HowItWorks from '../components/HowItWorks';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Other sections */}
      <HowItWorks />
      {/* Other sections */}
    </div>
  );
};
```

## Component Structure

```
HowItWorks/
├── HowItWorks.jsx      # Main component
├── HowItWorks.css      # Styles with Tailwind-inspired design
├── index.js           # Export file
└── README.md          # This file
```

## Props

The component accepts no props and uses internal data for the three cards:

1. **Lead Capture** - Multi-channel collection
2. **Lead Nurturing** - Personalized engagement  
3. **Sales Conversion** - Seamless handoff

## Customization

### Card Data
Edit the `cards` array in `HowItWorks.jsx` to modify content:

```jsx
const cards = [
  {
    id: 1,
    title: "Your Title",
    subtitle: "Your Subtitle", 
    description: "Your description",
    features: ["Feature 1", "Feature 2"],
    image: "your-image-url",
    color: "#your-color"
  }
];
```

### Animation Timing
Modify the easing and duration in the component:

```jsx
// Card transitions
transition: {
  duration: 0.55,
  ease: [0.22, 0.9, 0.35, 1] // cubic-bezier
}

// Lenis configuration
duration: 1.2,
easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
```

### Styling
The component uses CSS custom properties and can be themed by overriding CSS variables or modifying `HowItWorks.css`.

## Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Keyboard navigation support
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Supports `prefers-contrast: high`
- **Live Regions**: `aria-live` for dynamic content updates
- **Semantic HTML**: Proper roles and landmarks

## Performance Optimizations

- **GPU Acceleration**: Uses `transform3d` and `will-change`
- **Throttled Animations**: Prevents excessive re-renders
- **Conditional Rendering**: Only renders visible cards
- **Lazy Loading**: Images load on demand
- **RAF Optimization**: Smooth 60fps animations

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: 480px - 767px
- **Small Mobile**: < 480px

## Keyboard Shortcuts

- **Arrow Down/Space**: Next card
- **Arrow Up**: Previous card
- **Home**: First card
- **End**: Last card
- **Tab**: Navigate between interactive elements

## Touch Gestures

- **Swipe Up**: Next card
- **Swipe Down**: Previous card
- **Tap**: Focus card (if not already focused)

## Troubleshooting

### Lenis Not Working
Ensure Lenis is properly initialized and not conflicting with other scroll libraries.

### Animations Not Smooth
Check that `will-change` properties are set and GPU acceleration is enabled.

### Accessibility Issues
Verify ARIA labels are properly set and focus management is working.

### Performance Issues
Ensure only visible cards are rendered and animations are throttled appropriately.

## License

This component is part of the sales lead management project and follows the same licensing terms.
