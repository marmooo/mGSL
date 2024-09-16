import { TextLineStream } from "jsr:@std/streams/text-line-stream";

const dict = [];
const alphabets = Array.from("abcdefghijklmnopqrstuvwxyz");
for (const alphabet of alphabets) {
  const filePath = `vendor/google-ngram-small-en/dist/1gram/${alphabet}.csv`;
  const file = await Deno.open(filePath);
  const lineStream = file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of lineStream) {
    const [word, count] = line.split(",");
    if (word.match(/^[a-z]+$/)) {
      dict.push([word, parseInt(count)]);
    }
  }
}
dict.sort((a, b) => b[1] - a[1]);
const tsv = dict.map((arr) => arr.join("\t")).join("\n");
Deno.writeTextFileSync("dist/mGSL.raw.lst", tsv);
