# `src/contexts`

Shared React Context infrastructure lives here.

- `createSafeContext.tsx` is a factory that produces a type-safe
  Context/Provider/hook trio without a fake default value, and without
  repeating boilerplate for every new context.

No application-specific context (cart, auth, user preferences, etc.) is
created in this milestone — those are out of scope (Cart and Auth are
explicitly excluded from Day 3) and will be added in the milestone that
needs them, using the factory above.
