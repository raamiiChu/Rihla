/**
 * Harakat (vowel marks) to strip before shaping.
 *
 * Strips U+064B–U+0650, U+0652, U+0656–U+065E and U+0670 (superscript alef).
 * Kept, because they are part of the spelling rather than optional vowels:
 * - U+0651 shadda: marks a doubled consonant, often written even in
 *   unvocalised text.
 * - U+0653 maddah, U+0654 / U+0655 hamza above / below, U+065F wavy hamza
 *   below: hamza is a consonant; removing it would change the letter,
 *   e.g. أ would become ا.
 */
const HARAKAT = /[\u064B-\u0650\u0652\u0656-\u065E\u0670]/g;

/**
 * Removes harakat from Arabic text while keeping letters, their dots, hamza,
 * maddah and shadda.
 *
 * Must run on the text **before** shaping: stripping glyphs after layout would
 * leave the joining forms chosen for the vocalised text.
 *
 * NFC runs first so decomposed sequences such as ا + U+0654 are composed into
 * أ (U+0623). Keeping hamza and maddah out of `HARAKAT` is the second line of
 * defence for sequences NFC cannot compose.
 */
export const stripHarakat = (text: string): string =>
  text.normalize("NFC").replace(HARAKAT, "");
