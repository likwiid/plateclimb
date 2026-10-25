# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-10-25

Smaller Android downloads. The app itself is unchanged.

### Changed

- The Android APK now comes as two files, one per CPU type. Most phones want
  `PlateClimb-1.0.1-arm64-v8a.apk`; `PlateClimb-1.0.1-armeabi-v7a.apk` is for older 32-bit
  phones.
- Release builds compress their native libraries and run R8 to drop unused
  code and resources, which takes each APK from about 70 to 80 MB to under
  30 MB.

## [1.0.0] - 2026-10-17

First public release. PlateClimb is the Foundational Fitness protocol as a
free, offline workout app for Android and iOS: no account, no server, no
sync, no backup, no AI service, and all data stays on the phone. The only
download is exercise photos.

### Added

- Foundational Fitness (12 weeks), following the weekly structure Andrew
  Huberman describes in *Protocols* and on the Huberman Lab podcast: Block 1
  (weeks 1 to 6), Block 2 (weeks 7 to 11) and a week off, with three lifting
  days, three cardio days and a rest and mobility day each week. Seeded on
  first launch and again after a reset, so the app opens straight into it.
- Prescribed sets, rep ranges, RPE targets, rest times, starting weights and
  coaching notes for every exercise, with two substitutions each and timed
  and bodyweight slots.
- Workout logging with weights pre-filled from the program, then from what
  you lifted last time, plus warm-up ramps, plus and minus steps, a rest timer
  with notifications, a rep counter and personal record cards.
- Exercise detail with a photo and a link to a form video.
- Optional forearm and stretching add-ons for any lifting day.
- kg and lb units with plate-sized increments.
- About 900 bundled exercises with instructions, and photos from
  free-exercise-db with an offline placeholder.
