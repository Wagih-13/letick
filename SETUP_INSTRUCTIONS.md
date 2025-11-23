# E-Commerce Platform Setup Instructions

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git

## 1. Install Dependencies

```bash
npm install
```

## 2. Install Drizzle ORM and PostgreSQL Dependencies

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

## 3. Database Setup

### Create PostgreSQL Database

```sql
CREATE DATABASE ecommerce_db;
```

Or using psql command line:

```bash
psql -U postgres
CREATE DATABASE ecommerce_db;
\q
```

### Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce_db
```

## 4. Generate and Run Migrations

### Generate migration files:

```bash
npx drizzle-kit generate:pg
```

### Push schema to database:

```bash
npx drizzle-kit push:pg
```

Or run migrations:

```bash
npx drizzle-kit migrate
```

## 5. Seed Initial Data (Optional)

Create a seed script at `src/shared/db/seed.ts`:

```typescript
import { db } from "./index";
import { roles, permissions, users, rolePermissions, userRoles } from "./schema";
import { hash } from "bcrypt";

async function seed() {
  // Create roles
  const [superAdminRole] = await db.insert(roles).values({
    name: "Super Admin",
    slug: "super_admin",
    description: "Full system access",
    isSystem: true,
  }).returning();

  const [adminRole] = await db.insert(roles).values({
    name: "Admin",
    slug: "admin",
    description: "Administrative access",
    isSystem: true,
  }).returning();

  const [userRole] = await db.insert(roles).values({
    name: "User",
    slug: "user",
    description: "Standard user access",
    isSystem: true,
  }).returning();

  // Create permissions
  const perms = await db.insert(permissions).values([
    { name: "Manage Users", slug: "users.manage", resource: "users", action: "manage" },
    { name: "View Users", slug: "users.view", resource: "users", action: "view" },
    { name: "Manage Products", slug: "products.manage", resource: "products", action: "manage" },
    { name: "View Products", slug: "products.view", resource: "products", action: "view" },
    { name: "Manage Orders", slug: "orders.manage", resource: "orders", action: "manage" },
    { name: "View Orders", slug: "orders.view", resource: "orders", action: "view" },
    { name: "Manage Categories", slug: "categories.manage", resource: "categories", action: "manage" },
    { name: "View Categories", slug: "categories.view", resource: "categories", action: "view" },
    { name: "Manage Settings", slug: "settings.manage", resource: "settings", action: "manage" },
    { name: "View Settings", slug: "settings.view", resource: "settings", action: "view" },
  ]).returning();

  // Assign all permissions to super admin
  await db.insert(rolePermissions).values(
    perms.map(perm => ({
      roleId: superAdminRole.id,
      permissionId: perm.id,
    }))
  );

  // Create super admin user
  const hashedPassword = await hash("admin123", 10);
  const [superAdminUser] = await db.insert(users).values({
    email: "admin@example.com",
    password: hashedPassword,
    firstName: "Super",
    lastName: "Admin",
    isActive: true,
    emailVerified: true,
  }).returning();

  // Assign super admin role to user
  await db.insert(userRoles).values({
    userId: superAdminUser.id,
    roleId: superAdminRole.id,
  });

  console.log("✅ Database seeded successfully!");
  console.log("Super Admin: admin@example.com / admin123");
}

seed().catch(console.error).finally(() => process.exit());
```

Run the seed:

```bash
npx tsx src/shared/db/seed.ts
```

## 6. Database Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/shared/db/seed.ts",
    "db:reset": "tsx src/shared/db/reset.ts"
  }
}
```

## 7. Verify Database Connection

Create a test script at `src/shared/db/test-connection.ts`:

```typescript
import { checkDatabaseConnection, closeDatabaseConnection } from "./index";

async function test() {
  const isConnected = await checkDatabaseConnection();
  
  if (isConnected) {
    console.log("✅ Database connection successful!");
  } else {
    console.error("❌ Database connection failed!");
  }
  
  await closeDatabaseConnection();
}

test();
```

Run it:

```bash
npx tsx src/shared/db/test-connection.ts
```

## 8. Drizzle Studio (Optional)

Launch Drizzle Studio to browse your database visually:

```bash
npm run db:studio
```

Access at: `https://local.drizzle.studio`

## Schema Overview

### Tables Created:
- **Users & Auth**: users, roles, permissions, user_roles, role_permissions, sessions, password_reset_tokens
- **Categories**: categories (with self-referential parent/child)
- **Products**: products, product_variants, product_images, product_categories, inventory
- **Orders**: orders, order_items
- **Shipping**: shipping_addresses, shipping_methods, shipments, tracking_updates
- **Reviews & Stories**: product_reviews, review_images, stories, story_views
- **Notifications**: notifications, email_logs, email_templates
- **System**: system_settings, audit_logs, backups, health_checks

## Next Steps

1. **Backend Development**:
   - Create repositories in `src/server/repositories/`
   - Create services in `src/server/services/`
   - Create controllers in `src/server/controllers/`
   - Create API routes in `src/app/api/`
   - Add middleware for auth, validation, error handling

2. **Frontend Integration**:
   - Connect dashboards to real API endpoints
   - Build product management UI
   - Build order management UI
   - Build user management UI with RBAC

3. **Authentication**:
   - Implement JWT-based auth
   - Add session management
   - Add password reset flow
   - Add email verification

## Troubleshooting

### Connection Errors
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

### Migration Errors
- Drop and recreate database if needed
- Check for syntax errors in schema files
- Ensure all imports are correct

### Permission Errors
- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO your_user;`

## Support

For issues or questions, refer to:
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
