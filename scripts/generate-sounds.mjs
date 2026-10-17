// SPDX-License-Identifier: GPL-3.0-or-later
// Synthesizes the app's UI sounds (16-bit mono PCM WAV) into assets/sounds.
// Run with: node scripts/generate-sounds.mjs
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 44100;
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/** A note: frequency in Hz, start and length in seconds, peak gain 0..1. */
function render(notes, totalSeconds) {
  const samples = new Float32Array(Math.ceil(totalSeconds * RATE));
  for (const { freq, start, length, gain } of notes) {
    const from = Math.floor(start * RATE);
    const count = Math.floor(length * RATE);
    for (let i = 0; i < count && from + i < samples.length; i++) {
      const t = i / RATE;
      const attack = Math.min(1, t / 0.005);
      const decay = Math.exp((-4 * t) / length);
      const tone = Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t);
      samples[from + i] += gain * attack * decay * tone;
    }
  }
  return samples;
}

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

const sounds = {
  'tap.wav': [render([{ freq: 1200, start: 0, length: 0.03, gain: 0.35 }], 0.03)],
  'set-complete.wav': [
    render(
      [
        { freq: 880, start: 0, length: 0.08, gain: 0.35 },
        { freq: 1320, start: 0.05, length: 0.07, gain: 0.3 },
      ],
      0.12,
    ),
  ],
  'timer-done.wav': [
    render(
      [
        { freq: 988, start: 0, length: 0.12, gain: 0.4 },
        { freq: 988, start: 0.16, length: 0.12, gain: 0.4 },
        { freq: 1319, start: 0.32, length: 0.13, gain: 0.4 },
      ],
      0.45,
    ),
  ],
  'workout-done.wav': [
    render(
      [
        { freq: 523, start: 0, length: 0.2, gain: 0.3 },
        { freq: 659, start: 0.15, length: 0.2, gain: 0.3 },
        { freq: 784, start: 0.3, length: 0.2, gain: 0.3 },
        { freq: 1047, start: 0.45, length: 0.3, gain: 0.3 },
      ],
      0.75,
    ),
  ],
};

for (const [name, [samples]] of Object.entries(sounds)) {
  writeFileSync(join(outDir, name), toWav(samples));
  console.log(`wrote ${name}`);
}
