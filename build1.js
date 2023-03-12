import { readLines } from "https://deno.land/std/io/mod.ts";

const dict = [];
const alphabets = Array.from("abcdefghijklmnopqrstuvwxyz");
for (const alphabet of alphabets) {
  const fileName = `vendor/google-ngram-small-en/dist/1gram/${alphabet}.csv`;
  const fileReader = await Deno.open(fileName);
  for await (const line of readLines(fileReader)) {
    const [word, count] = line.split(",");
    if (word.match(/^[a-z]+$/)) {
      dict.push([word, parseInt(count)]);
    }
  }
}
dict.sort((a, b) => b[1] - a[1]);
const tsv = dict.map((arr) => arr.join("\t")).join("\n");
Deno.writeTextFileSync("dist/mGSL.raw.lst", tsv);
