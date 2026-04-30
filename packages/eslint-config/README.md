# `@workspace/eslint-config`

Shared ESLint configuration for the Bandanaiera Admin workspace.

## Usage

Add this package to your `package.json`:

```json
{
  "devDependencies": {
    "@workspace/eslint-config": "workspace:*"
  }
}
```

Create an `eslint.config.js` in your project:

```javascript
import config from "@workspace/eslint-config"

export default config
```

## Included Rules

This configuration includes:

- TypeScript support via `@typescript-eslint/parser`
- React/Next.js specific rules
- Import sorting and organization
- Code quality and best practices

## Rules

- TypeScript strict checking
- React Hooks exhaustive dependencies
- No unused variables
- Consistent imports

## Flat Config

This package uses ESLint's new flat config format (eslint.config.js).
