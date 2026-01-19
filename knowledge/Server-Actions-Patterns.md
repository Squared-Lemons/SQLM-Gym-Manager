# Server Actions Patterns

Patterns for Next.js Server Actions with authentication and database operations.

---

## Basic Structure

```typescript
// apps/web/lib/actions/[resource].ts
"use server";

import { db } from "@app/database";
import { items } from "@app/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@app/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
```

---

## CRUD Pattern

### Create

```typescript
export async function createItem(data: {
  name: string;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  await db.insert(items).values({
    id: nanoid(),
    userId: session.user.id,
    name: data.name,
    slug,
    description: data.description || null,
  });

  revalidatePath("/items");
}
```

### Read (with organization scope)

```typescript
export async function getItems() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const activeOrg = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  if (!activeOrg) {
    return [];
  }

  return db.query.items.findMany({
    where: eq(items.organizationId, activeOrg.id),
    orderBy: (items, { desc }) => [desc(items.createdAt)],
  });
}
```

### Update

```typescript
export async function updateItem(
  id: string,
  data: Partial<{
    name: string;
    description: string;
  }>
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db
    .update(items)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(items.id, id));

  revalidatePath("/items");
}
```

### Delete

```typescript
export async function deleteItem(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(items).where(eq(items.id, id));
  revalidatePath("/items");
}
```

---

## Zod Validation

```typescript
import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export async function createItem(input: CreateItemInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validated = createItemSchema.parse(input);

  await db.insert(items).values({
    id: nanoid(),
    ...validated,
  });

  revalidatePath("/items");
}
```

---

## Error Handling

```typescript
export async function createItem(data: CreateItemInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const validated = createItemSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors };
    }

    await db.insert(items).values({
      id: nanoid(),
      ...validated.data,
    });

    revalidatePath("/items");
    return { success: true };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { error: "Failed to create item" };
  }
}
```

---

## Using with Forms

```tsx
"use client";

import { useTransition } from "react";
import { createItem } from "@/lib/actions/items";
import { toast } from "sonner";

function CreateItemForm() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createItem({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Item created");
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="description" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

---

## Onboarding Status Check

```typescript
export async function checkOnboardingStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { hasUser: false, hasOrganization: false, hasSetup: false };
  }

  const activeOrg = await auth.api.getFullOrganization({
    headers: await headers(),
  });

  const hasOrganization = !!activeOrg;

  // Check for app-specific setup (e.g., first gym created)
  let hasSetup = false;
  if (activeOrg) {
    const setupItem = await db.query.items.findFirst({
      where: eq(items.organizationId, activeOrg.id),
    });
    hasSetup = !!setupItem;
  }

  return {
    hasUser: true,
    hasOrganization,
    hasSetup,
  };
}
```

---

## Batch Operations

```typescript
export async function bulkDeleteItems(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.delete(items).where(inArray(items.id, ids));
  revalidatePath("/items");
}
```

---

## With Relations

```typescript
export async function getItemWithRelations(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return db.query.items.findFirst({
    where: eq(items.id, id),
    with: {
      category: true,
      tags: true,
      comments: {
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        limit: 10,
      },
    },
  });
}
```

---

## Tips

1. **Always check auth first** - Return early if unauthorized
2. **Use revalidatePath** - Keep UI in sync after mutations
3. **Validate input** - Use Zod for type-safe validation
4. **Handle errors gracefully** - Return error objects instead of throwing
5. **Use transactions** - For multi-table operations that must succeed together

---

*See also: [Better Auth Guide](../auth/better-auth/Better-Auth-Guide.md), [Drizzle ORM Guide](../database/drizzle/Drizzle-ORM-Guide.md)*
