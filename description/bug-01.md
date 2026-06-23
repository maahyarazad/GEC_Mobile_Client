# Bug 0: Hide Navbar for Logged-Out Users

## Target Files

- **Navbar.css**
- **Navbar.tsx**

## Description

- When a user is logged out, the entire sidebar should be hidden.
- The sidebar should only be visible to authenticated users.



## Part 2

## Target Files

- **Navbar.css**
- **Navbar.tsx**

## Description

- Fix the compiler error

```txt
Compiled with problems:
×
ERROR
[eslint] 
src/components/Navbar/Navbar.tsx
  Line 32:5:  React Hook "useLayoutEffect" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks

Search for the keywords to learn more about each error.
```


## Part 3

### Description

After migrating to the new `AuthContext` implementation and the `useAuth` hook, the navbar links are no longer being displayed.

Reading user roles is causing continuous runtime errors, resulting in authentication failures and preventing the navbar from rendering correctly.

Please thoroughly review all modified files related to authentication, authorization, and navbar rendering. Identify the root cause of the issue and ensure that role-based navigation works correctly without triggering runtime errors.

### Error

```txt
Uncaught runtime errors:
×

ERROR
success: false
message: "Authentication failed"
auth: false

Error:
success: false
message: "Authentication failed"
auth: false

    at handleError (http://localhost:3333/admin/application/static/js/bundle.js:202115:58)
    at http://localhost:3333/admin/application/static/js/bundle.js:202138:7
```