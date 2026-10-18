# Contributing to PlateClimb

Thanks for taking the time to help. Bug reports, fixes, tests and small
focused features are all welcome.

## Before you start

- For anything bigger than a small fix, open an issue first so we can agree on
  the approach before you spend time on it.
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for the module map, the data model
  and how the program is seeded.
- By contributing you agree that your work is licensed under the project's
  license, GPL-3.0-or-later, including the app store permission in
  [APP-STORE-EXCEPTION.md](APP-STORE-EXCEPTION.md).

## Setup

You need Node 20 and npm, plus the Android SDK or Xcode. PlateClimb is a
mobile app for Android and iOS; it uses native modules and does not run in
Expo Go.

```bash
npm ci
npm run typecheck
npm run lint
npm test
```

To run the app:

```bash
npm run android      # or: npm run ios, builds the development client once
npm start            # starts Metro for the development client
```

There are no environment variables, keys or servers to set up. The app is fully
offline.

## Making changes

1. Fork the repository and create a branch from `main`, named with a prefix:
   `feat-`, `fix-`, `docs-`, `refactor-`, `test-` or `chore-`, for example
   `fix-rest-timer-sound`.
2. Keep each pull request focused on one thing.
3. Write commit messages as a single line: `prefix: description`, for example
   `fix: keep the rest timer running when the screen locks`.
4. Add or update tests for logic changes. Pure modules (program data checks,
   weight pre-fill, labels, photo lookup) should stay free of React Native
   imports so Jest can test them directly.
5. Run `npm run typecheck`, `npm run lint` and `npm test` before you push. CI
   runs the same checks.
6. Add the SPDX header to new source files:

   ```ts
   // SPDX-License-Identifier: GPL-3.0-or-later
   ```

## Changing the program

PlateClimb ships one program on purpose. The data lives in
`src/data/program/foundationalFitness.json`, which
`scripts/build-program-data.mjs` generates from an export of the program
tables:

```bash
node scripts/build-program-data.mjs path/to/export.json
```

- Fixes to the program (a wrong rep range, a better note, a missing
  substitution) are welcome. Edit the JSON or the notes in the script, and
  keep `src/data/__tests__/foundationalFitness.test.ts` passing.
- Write notes in your own words. Never copy text from the book or paid
  material.
- Do not add other programs or anything that implies the program is
  endorsed by Andrew Huberman or Huberman Lab.

## Code guidelines

- TypeScript strict. Validate data only at boundaries (imported files,
  network responses).
- Comments explain why, not what.
- The app is dark theme only and must stay quick to use between sets.
- Keep the app fully offline: no accounts, servers, sync, backup, AI
  services or analytics. A new feature must work without a connection. The only network
  use is downloading exercise photos; anything new must be discussed in an
  issue first.
- Use plain hyphens in user-visible text, not em or en dashes.

## Reporting bugs

Use the bug report template. Include your platform, device, app version and,
if you can, the steps to reproduce. Please remove personal data from logs and
screenshots before you attach them.

## Security issues

Do not open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
taking part you agree to uphold it.
