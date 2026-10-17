# Security policy

## Supported versions

Security fixes go into the latest release on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for security problems. Email
[hello@likwiid.com](mailto:hello@likwiid.com) with:

- what you found and where (file, screen or endpoint);
- steps to reproduce, or a proof of concept;
- the impact you expect.

You should get a reply within a week. Once a fix is ready we will publish it
and credit you in the release notes, unless you prefer to stay anonymous.

## Scope

PlateClimb stores training data on the device only. It has no account, server,
sync or AI service, and the only network request it makes is downloading
exercise photos from free-exercise-db on `raw.githubusercontent.com`. Reports
about the following are especially welcome:

- training data leaving the device in any way;
- any network request other than those exercise photos;
- data that survives "Reset All Data" when it should not.
