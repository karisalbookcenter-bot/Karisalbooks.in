# Patch: src/config/auth.ts

Sprint 14 requires exactly ONE line changed in this file — everything else
(routes, minimumAdminRole, protectedRoutePrefixes) stays as Sprint 05 left it.

This is provided as a patch instruction rather than a full-file replacement:
the complete current contents of this file were not independently re-verified
against the repository for this package, and overwriting a real file with a
reconstructed one risks silently discarding code that isn't shown here.

## Change

Find this line inside `authConfig`:

```ts
adminRoutePrefixes: [],
```

Replace it with:

```ts
adminRoutePrefixes: ["/admin"],
```

That's it. No other line in `src/config/auth.ts` should change.

## Why

This single value is what `handleAuthMiddleware` (Sprint 05,
`src/features/auth/middleware/auth.middleware.ts`) has been checking against
since it was written — the middleware logic itself needs no changes, it was
built to wait for this array to gain an entry.
