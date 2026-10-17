// SPDX-License-Identifier: GPL-3.0-or-later
import rawExercises from "./exercises.json";

/**
 * Exercise photos come from the free-exercise-db repository (Unlicense) and are
 * loaded straight from GitHub. Each exercise has start and end position images
 * (0.jpg and 1.jpg). When a photo is missing or cannot load, the app shows a
 * bundled placeholder instead, so nothing depends on the network.
 */
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

interface ExerciseImageEntry {
  id: string;
  name: string;
  images: string[];
}

/**
 * The bundled program uses common gym names. These map them to the closest
 * free-exercise-db entry so they get a photo too. Names that already match a
 * free-exercise-db entry need no alias.
 */
const NAME_ALIASES: Record<string, string> = {
  "Assisted Pull-Up": "Band_Assisted_Pull-Up",
  "Bench Dip": "Bench_Dips",
  "Cable Pec Flye": "Cable_Crossover",
  "Chest-Supported Machine Row": "Leverage_Iso_Row",
  "Chest-Supported T-Bar Row": "Lying_T-Bar_Row",
  "DB Bulgarian Split Squat": "Split_Squat_with_Dumbbells",
  "DB Flye": "Dumbbell_Flyes",
  "DB Incline Curl": "Incline_Dumbbell_Curl",
  "DB Lat Pullover": "Bent-Arm_Dumbbell_Pullover",
  "DB Lateral Raise": "Side_Lateral_Raise",
  "DB Reverse Lunge": "Dumbbell_Rear_Lunge",
  "DB Step-Up": "Dumbbell_Step_Ups",
  "Decline Machine Chest Press": "Leverage_Decline_Chest_Press",
  "Donkey Calf Raise": "Donkey_Calf_Raises",
  "EZ-bar Skull Crusher": "EZ-Bar_Skullcrusher",
  "Glute-Ham Raise": "Glute_Ham_Raise",
  "Leg Press Calf Press": "Calf_Press_On_The_Leg_Press_Machine",
  "Low Incline DB Press": "Incline_Dumbbell_Press",
  "Low Incline Machine Press": "Leverage_Incline_Chest_Press",
  "Low Incline Smith Machine Press": "Smith_Machine_Incline_Bench_Press",
  "Lying Leg Curl": "Lying_Leg_Curls",
  "Machine Crunch": "Ab_Crunch_Machine",
  "Machine Shoulder Press": "Machine_Shoulder_Military_Press",
  "Neck Extension (Plate, Prone)": "Lying_Face_Down_Plate_Neck_Resistance",
  "Neck Flexion (Plate, Supine)": "Lying_Face_Up_Plate_Neck_Resistance",
  "Neutral-Grip Pullup": "V-Bar_Pullup",
  "Overhand Lat Pulldown": "Wide-Grip_Lat_Pulldown",
  "Overhead Cable Triceps Extension (Bar)": "Cable_Rope_Overhead_Triceps_Extension",
  "Overhead Cable Triceps Extension (Rope)": "Cable_Rope_Overhead_Triceps_Extension",
  "Paused Assisted Dip": "Dips_-_Triceps_Version",
  "Paused Barbell RDL": "Romanian_Deadlift",
  "Paused DB RDL": "Stiff-Legged_Dumbbell_Deadlift",
  "Pec Deck": "Butterfly",
  "Plate-Weighted Crunch": "Weighted_Crunches",
  "Rear Delt 45° Cable Flye": "Cable_Rear_Delt_Fly",
  "Reverse Pec Deck": "Reverse_Machine_Flyes",
  "Seated DB Shoulder Press": "Seated_Dumbbell_Press",
  "Slow-Eccentric DB Incline Curl": "Incline_Dumbbell_Curl",
  "Standing Calf Raise": "Standing_Calf_Raises",
  "Triceps Diverging Pressdown (Long Rope or 2 Ropes)": "Triceps_Pushdown_-_Rope_Attachment",
  "Wide-Grip Band-Assisted Pull-Up": "Band_Assisted_Pull-Up",
};

let byId: Map<string, string[]> | null = null;
let byName: Map<string, string[]> | null = null;

function buildMaps(): void {
  if (byId && byName) return;
  byId = new Map();
  byName = new Map();
  for (const ex of rawExercises as ExerciseImageEntry[]) {
    if (ex.images && ex.images.length > 0) {
      byId.set(ex.id, ex.images);
      byName.set(ex.name.toLowerCase(), ex.images);
    }
  }
}

function imagesForId(exerciseId: string): string[] {
  buildMaps();
  return byId!.get(exerciseId) ?? [];
}

function imagesForName(name: string): string[] {
  buildMaps();
  const alias = NAME_ALIASES[name.trim()];
  if (alias) return byId!.get(alias) ?? [];
  return byName!.get(name.trim().toLowerCase()) ?? [];
}

const toUrl = (img: string) => `${GITHUB_RAW_BASE}/${img}`;

/** First (start position) image for a free-exercise-db id, or null. */
export function getExerciseImageUrl(exerciseId: string): string | null {
  const images = imagesForId(exerciseId);
  return images.length > 0 ? toUrl(images[0]) : null;
}

/** All images (usually start and end position) for a free-exercise-db id. */
export function getExerciseImageUrls(exerciseId: string): string[] {
  return imagesForId(exerciseId).map(toUrl);
}

/** First image for an exercise as named in the app's database, or null. */
export function getExerciseImageUrlByName(name: string): string | null {
  const images = imagesForName(name);
  return images.length > 0 ? toUrl(images[0]) : null;
}

/** Whether an exercise id has images available. */
export function hasExerciseImages(exerciseId: string): boolean {
  return imagesForId(exerciseId).length > 0;
}
