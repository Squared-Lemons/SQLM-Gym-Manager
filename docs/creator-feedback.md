# Creator Feedback - Gym Management Project

## Feedback from gym-management - 2025-01-19

### Knowledge Gaps
- Better Auth Organizations plugin documentation could include more examples of linking organizations to custom business tables
- QR code generation patterns for member check-in systems would be useful to document

### Setup Issues
- SQLite native module handling in Next.js should be pre-configured in the template
- Environment variable structure with symlinks could be documented better

### New Patterns
- Multi-tenant SaaS with Better Auth Organizations + custom business tables
- Monorepo structure with shared UI, database, and auth packages
- Server actions pattern for CRUD operations in Next.js 15

### Technical Gotchas
- Better Auth requires **singular** table names (user, session, member) - this differs from common conventions
- `better-sqlite3` needs webpack externals configuration in Next.js:
  ```javascript
  serverExternalPackages: ["better-sqlite3", "@app/database"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ "better-sqlite3": "commonjs better-sqlite3" });
    }
    return config;
  }
  ```
- DATABASE_URL must be relative path from the app directory when using symlinked .env files
