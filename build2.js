import { readLines } from "https://deno.land/std/io/mod.ts";
import { expandGlob } from "https://deno.land/std/fs/expand_glob.ts";

const gTLD =
  /\.(com|net|org|edu|gov|mil|int|blz|info|name|pro|museum|aero|coop|jobs|travel|mobi|cat|tel|asia|post|xxx)/;
// const gsl = { constructor:0 };  // TODO: Node.js bug?
const gsl = new Map();
for await (const file of expandGlob("1/*.lst")) {
  const fileReader = await Deno.open(file.path);
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const arr = line.toLowerCase().split("\t");
    const count = parseInt(arr[2]);
    const lemma = arr[0];
    if (lemma.match(/^[a-z]\.$/)) { // skip
    } else if (lemma.match(/^[b-hj-z]$/)) { // skip
    } else if (lemma.match(/^([a-z])\1{2,}\.?$/)) { // skip
    } else if (lemma.match(/www\./)) { // skip
    } else if (lemma.match(gTLD)) { // skip
    } else if (!lemma.match(/[^a-z.]/)) {
      if (gsl.has(lemma)) {
        gsl.set(lemma, count + gsl.get(lemma));
      } else {
        gsl.set(lemma, count);
      }
    }
  }
}

const mgsl = [...gsl.entries()];
mgsl.sort((ax, bx) => {
  const a = ax[1], b = bx[1];
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
});
mgsl.forEach((x) => {
  console.log(x[0] + "\t" + x[1]);
});
