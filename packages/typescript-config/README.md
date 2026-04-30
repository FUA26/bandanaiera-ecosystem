# `@workspace/typescript-config`

Shared TypeScript configuration for the Bandanaiera Admin workspace.

## Usage

Add this package to your `package.json`:

```json
{
  "devDependencies": {
    "@workspace/typescript-config": "workspace:*"
  }
}
```

Extend this configuration in your `tsconfig.json`:

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    // Your project-specific options
  }
}
```

## Available Configurations

### `base.json`

Base TypeScript configuration with:

- Strict mode enabled
- ES2022 target
- CommonJS/ESM module resolution
- Path alias support

### `nextjs.json`

Configuration for Next.js projects extending `base.json` with:

- Next.js-specific plugins
- App Router support
- React Server Components support

## Compiler Options

- **strict**: `true` - Enable all strict type checking options
- **target**: `ES2022` - Modern JavaScript target
- **moduleResolution**: `bundler` - Bundler-aware module resolution
- **resolveJsonModule**: `true` - Allow importing JSON files
- **esModuleInterop**: `true` - Better ESM/CommonJS compatibility
- **skipLibCheck**: `true` - Skip type checking of declaration files
- **forceConsistentCasingInFileNames**: `true` - Enforce consistent casing

## Path Aliases

The workspace uses `@workspace/*` aliases for internal packages:

```json
{
  "compilerOptions": {
    "paths": {
      "@workspace/ui": ["../../packages/ui/src"],
      "@workspace/ui/*": ["../../packages/ui/src/*"]
    }
  }
}
```
