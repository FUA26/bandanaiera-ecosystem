# Typography System

## Type Scale

We use a fluid type scale for marketing/landing pages with semantic class names:

| Class              | Usage                 | Size Range                             | Line-height | Weight | Font    |
| ------------------ | --------------------- | -------------------------------------- | ----------- | ------ | ------- |
| `.heading-display` | Hero headlines        | clamp(2.5rem, 5vw + 1rem, 4.5rem)      | 1.1         | 700    | Manrope |
| `.heading-hero`    | Section headings      | clamp(2rem, 4vw + 0.5rem, 3rem)        | 1.15        | 700    | Manrope |
| `.heading-section` | Subsection headings   | clamp(1.25rem, 2vw + 0.25rem, 1.75rem) | 1.3         | 600    | Manrope |
| `.heading-card`    | Card/component titles | 1.125rem                               | 1.4         | 600    | Manrope |
| `.text-body-lg`    | Large body text       | 1.125rem                               | 1.6         | 400    | Inter   |
| `.text-body`       | Standard body text    | 1rem                                   | 1.65        | 400    | Inter   |
| `.text-body-sm`    | Small body text       | 0.875rem                               | 1.6         | 400    | Inter   |

## Design Decisions

1. **Font pairing**: Manrope for headings (warm, human, approachable) + Inter for body (neutral, readable for code/technical content)
2. **Fluid sizing for headings**: Uses `clamp()` for responsive scaling without breakpoints
3. **Reduced tracking**: Letter-spacing goes from -0.02em (largest) to -0.01em (smaller headings)
4. **Max-width constraints**: Body text is capped at 65-75ch for optimal readability
5. **Dark mode adjustment**: Line-height increases slightly in dark mode for better readability

## Font Stack

- **Headings**: Manrope (weights: 500, 600, 700, 800) - Warm, approachable, distinctive
- **Body**: Inter Variable (weights: 400, 500, 600) - Clean, neutral, excellent for developer tools
- **Mono**: Geist Mono - For code/terminals

## Why Manrope?

Manrope brings warmth and personality to headings while remaining professional enough for developer tools. Its geometric shapes with humanist touches create a friendly, approachable feel that aligns with Bandanaiera's "capable friend" brand personality.

## Usage

```tsx
// Hero headline
<h1 className="heading-display">Skip boilerplate. Ship features.</h1>

// Section heading
<h2 className="heading-hero">Everything you need.</h2>

// Body text
<p className="text-body">Standard paragraph text.</p>
<p className="text-body-lg">Large paragraph text for descriptions.</p>
```

## Principles

1. **Consistent hierarchy**: Use the semantic classes instead of arbitrary sizes
2. **Measure matters**: Keep text under 75 characters per line for readability
3. **Scale contrast**: Each level has at least 1.25× ratio from the next
4. **Font weight discipline**: 700 for main headings, 600 for secondary headings, 400 for body
5. **Warmth through typography**: Manrope headings provide personality while Inter body keeps things readable
