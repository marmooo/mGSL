import { TextLineStream } from "jsr:@std/streams";

function getLineStream(file) {
  return file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
}

async function getAllLemmas() {
  const allLemmas = new Set();
  const file = await Deno.open("dist/mGSL.raw.lst");
  for await (const line of getLineStream(file)) {
    const lemma = line.split("\t")[0];
    allLemmas.add(lemma);
  }
  return allLemmas;
}

async function listup() {
  const list = [];
  const file = await Deno.open("filter-original.lst");
  for await (const lemma of getLineStream(file)) {
    if (allLemmas.has(lemma)) list.push(lemma);
  }
  list.sort().forEach((lemma) => {
    console.log(lemma);
  });
}

const allLemmas = await getAllLemmas();
await listup();
