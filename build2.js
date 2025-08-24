import { TextLineStream } from "@std/streams";

function getLineStream(file) {
  return file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
}

const lemmatizationDict = new Map();
lemmatizationDict.set("an", "a");
let file = await Deno.open("vendor/agid-2016.01.19/infl.txt");
for await (const line of getLineStream(file)) {
  const [toStr, fromStr] = line.split(": ");
  if (!toStr.includes("?")) {
    const [to, _toPos] = toStr.split(" ");
    const froms = [];
    fromStr.split(" | ").forEach((forms) => {
      forms.split(", ").forEach((entry) => {
        if (!entry.match(/[~<!?]/)) {
          const word = entry.split(" ")[0];
          froms.push(word);
        }
      });
    });
    froms.forEach((from) => {
      lemmatizationDict.set(from, to);
    });
  }
}
lemmatizationDict.delete("danger");

const gsl = new Map();
file = await Deno.open("dist/mGSL.raw.lst");
for await (const line of getLineStream(file)) {
  let [lemma, count] = line.split("\t");
  count = parseInt(count);
  if (lemmatizationDict.has(lemma)) {
    const newLemma = lemmatizationDict.get(lemma);
    if (gsl.has(newLemma)) {
      gsl.set(newLemma, count + gsl.get(newLemma));
    } else {
      gsl.set(newLemma, count);
    }
  } else {
    gsl.set(lemma, count);
  }
}

const mgsl = [...gsl.entries()];
mgsl.sort((a, b) => b[1] - a[1]);
const tsv = mgsl.map((arr) => arr.join("\t")).join("\n");
Deno.writeTextFileSync("dist/mGSL.lemmatized.lst", tsv);
