# HowItWorksParallax Component

A React component that creates scroll-linked parallax effects for cards using Framer Motion and Lenis for smooth scrolling.

## Features

- **Scroll-linked Parallax**: Cards translate up to ±22px on Y-axis based on scroll position
- **Subtle Scaling**: Cards scale up to 1.03 for depth perception
- **Opacity Fade**: Cards fade to 0.75 opacity as they move out of view
- **Spring Animations**: Smooth entrance animations with staggered delays
- **GPU Optimized**: Uses only `transform` and `opacity` for 60fps performance
- **Accessibility**: Respects `prefers-reduced-motion` setting
- **Smooth Scrolling**: Integrated Lenis for buttery-smooth scroll experience

## Installation

```bash
npm install @studio-freight/lenis framer-motion
```

## Usage

### Basic Usage

```jsx
import HowItWorksParallax from './components/HowItWorksParallax';

const MyComponent = () => {
  const cards = [
    <div className="how-card">
      <h3>Card 1</h3>
      <p>Content for card 1</p>
    </div>,
    <div className="how-card">
      <h3>Card 2</h3>
      <p>Content for card 2</p>
    </div>,
    <div className="how-card">
      <h3>Card 3</h3>
      <p>Content for card 3</p>
    </div>
  ];

  return (
    <HowItWorksParallax cards={cards} />
  );
};
```

### Advanced Usage with Custom Props

```jsx
import HowItWorksParallax from './components/HowItWorksParallax';

const MyComponent = () => {
  const cards = [
    <div className="how-card custom-card">
      <div className="card-header">
        <span className="card-number">001</span>
        <h3>Lead Capture</h3>
      </div>
      <div className="card-content">
        <p>Automatically capture leads from multiple channels...</p>
        <ul>
          <li>Multi-channel collection</li>
          <li>Real-time scoring</li>
          <li>CRM integration</li>
        </ul>
      </div>
      <div className="card-visual">
        <div className="icon">📊</div>
      </div>
    </div>,
    // ... more cards
  ];

  return (
    <HowItWorksParallax 
      cards={cards}
      className="my-parallax-section"
      staggerDelay={0.1}
      translateRange={30}
      scaleRange={0.05}
      opacityRange={0.3}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `Array<ReactElement>` | `[]` | Array of React elements with `.how-card` class |
| `className` | `string` | `''` | Additional CSS class for the container |
| `staggerDelay` | `number` | `0.08` | Delay between card animations in seconds |
| `translateRange` | `number` | `22` | Y-axis translation range in pixels |
| `scaleRange` | `number` | `0.03` | Scale range (0.03 = 3% scale change) |
| `opacityRange` | `number` | `0.25` | Opacity range (0.25 = 25% opacity change) |

## CSS Classes

### Required Classes for Cards

Your cards must have the `.how-card` class for proper styling:

```css
.how-card {
  /* Your existing card styles */
  background: #ffffff;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  /* ... other styles */
}
```

### Component Classes

- `.how-it-works-parallax-container` - Main container
- `.how-it-works-parallax-sticky` - Sticky wrapper
- `.how-it-works-parallax-card` - Individual card wrapper

## Performance Optimizations

- **GPU Acceleration**: Uses `transform` and `opacity` only
- **Hardware Acceleration**: `will-change: transform, opacity`
- **Smooth Rendering**: `backface-visibility: hidden`
- **Optimized Scrolling**: Lenis integration for 60fps

## Accessibility

- **Reduced Motion**: Automatically disables animations when `prefers-reduced-motion: reduce`
- **Keyboard Navigation**: Maintains focus management
- **Screen Readers**: Preserves semantic structure

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Hardware acceleration support recommended
- Lenis requires modern JavaScript features

## Troubleshooting

### Cards Not Animating
- Ensure cards have the `.how-card` class
- Check that Lenis is properly installed
- Verify Framer Motion is working

### Performance Issues
- Check if `prefers-reduced-motion` is enabled
- Ensure GPU acceleration is available
- Reduce the number of cards if needed

### Sticky Positioning Issues
- Verify parent containers don't have `overflow: hidden`
- Check z-index conflicts
- Ensure sufficient viewport height
