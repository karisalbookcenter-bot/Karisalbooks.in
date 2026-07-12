# `src/features/auth`

Authentication Foundation — Sprint 05. Provides the reusable service,
types, hooks, session helpers, and middleware logic that every future
login/logout UI, protected page, and admin surface will build on.

No login/register/forgot-password/OTP/magic-link/social-login UI is
implemented here — those are future milestones. This folder only provides
the architecture they will plug into.

## Structure

```
auth/
├── types/
│   └── auth.types.ts        # AuthUser, AuthSession, AuthState, AuthResult, ...
├── services/
│   ├── auth.service.ts      # Client-side: signInWithPassword, signOut, getCurrentSession, onAuthStateChange
│   └── session.service.ts   # Server-side: getServerAuthUser, isAuthenticated, hasMinimumRole, hasServerPermission
├── context/
│   └── AuthProvider.tsx     # Client-side auth state, built on @/contexts/createSafeContext
├── hooks/
│   ├── useAuth.ts            # Full auth context (status, user, session, signIn, signOut, refreshSession)
│   ├── useSession.ts         # Just { session, status }
│   ├── useRole.ts             # Current role + useHasMinimumRole(role)
│   └── usePermission.ts       # usePermission(permission): boolean
├── middleware/
│   └── auth.middleware.ts    # Request-level logic used by the root src/middleware.ts
└── components/                # Empty — no UI this sprint
```

Role definitions (`ROLES`, `ROLE_HIERARCHY`) and permission constants
(`PERMISSIONS`, `ROLE_PERMISSIONS`) live in `src/constants/` rather than
here — they're cross-cutting (the future Admin Dashboard, Product
Management, and Order Management milestones all need them too), following
the Day 3 rule that anything used by two or more features is promoted to a
shared top-level folder.

See `docs/AUTH_ARCHITECTURE.md` for the full explanation of how login,
sessions, middleware, protected routes, and future admin pages fit
together.
