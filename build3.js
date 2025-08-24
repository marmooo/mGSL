import { TextLineStream } from "@std/streams";

function getLineStream(file) {
  return file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
}

async function loadLineDict(filepath) {
  const dict = new Map();
  const file = await Deno.open(filepath);
  for await (const lemma of getLineStream(file)) {
    dict.set(lemma, true);
  }
  return dict;
}

function loadFilterNumbers() {
  return loadLineDict("filter-numbers.lst");
}

async function loadFilterChemicals() {
  const filterChemicals = new Map();
  const file = await Deno.open("filter-chemicals.csv");
  for await (const line of getLineStream(file)) {
    const lemma = line.split(",")[0].toLowerCase();
    filterChemicals.set(lemma, true);
  }
  filterChemicals.delete("he");
  filterChemicals.delete("os");
  return filterChemicals;
}

async function loadFilterOriginal() {
  const filterOriginal = new Map();
  const file = await Deno.open("filter-original.csv");
  for await (const line of getLineStream(file)) {
    const [en, _notes] = line.split(",");
    filterOriginal.set(en, true);
    filterOriginal.set(en.toLowerCase(), true);
  }
  return filterOriginal;
}

async function loadOriginal() {
  const original = new Map();
  const file = await Deno.open("def.csv");
  for await (const line of getLineStream(file)) {
    const [en, ja, _notes] = line.split(",");
    original.set(en, ja);
  }
  return original;
}

function loadBadWords() {
  return loadLineDict(
    "vendor/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/en",
  );
}

function loadProfanityWords() {
  return loadLineDict("vendor/Google-profanity-words/data/en.txt");
}

async function loadNames() {
  const names = new Map();
  const dicts = [
    // "vendor/NameDatabases/NamesDatabases/surnames/all.txt",
    "vendor/NameDatabases/NamesDatabases/first names/all.txt",
  ];
  for (const dict of dicts) {
    const file = await Deno.open(dict);
    for await (const lemma of getLineStream(file)) {
      names.set(lemma.toLowerCase(), true);
    }
  }
  return names;
}

async function loadLangs() {
  const langs = new Map();
  const file = await Deno.open("vendor/language-list/data/en/language.csv");
  for await (const line of getLineStream(file)) {
    const [lang1, lang2] = line.split(",");
    langs.set(lang1, true);
    langs.set(lang2, true);
    langs.set(lang2.toLowerCase(), true);
  }
  return langs;
}

async function loadCountries() {
  const countries = new Map(); // 省略名だけ登録
  const file = await Deno.open(
    "vendor/language-list/data/en/language.csv",
  );
  for await (const line of getLineStream(file)) {
    const [country1, _country2] = line.split(",");
    countries.set(country1, true);
    countries.set(country1.toLowerCase(), true);
  }
  return countries;
}

async function loadCities() {
  const cities = new Map();
  const file = await Deno.open(
    "vendor/world-cities/data/world-cities.csv",
  );
  for await (const line of getLineStream(file)) {
    const row = line.split(",");
    const city = row[0].toLowerCase();
    const country = row[1].toLowerCase();
    cities.set(city, true);
    cities.set(country, true);
  }
  cities.delete("name");
  cities.delete("country");
  return cities;
}

async function loadAbbrevs() {
  const abbrevs = new Map();
  const file = await Deno.open("vendor/Abbreviations/sources.txt");
  for await (const line of getLineStream(file)) {
    const lemma = line.split(" ")[1].toLowerCase();
    abbrevs.set(lemma, true);
  }
  return abbrevs;
}

const filterNumbers = await loadFilterNumbers();
const filterChemicals = await loadFilterChemicals();
const filterOriginal = await loadFilterOriginal();
const original = await loadOriginal();
const badWords = await loadBadWords();
const profanityWords = await loadProfanityWords();
const names = await loadNames();
const langs = await loadLangs();
const countries = await loadCountries();
const cities = await loadCities();
const abbrevs = await loadAbbrevs();

const dict = [];
const file = await Deno.open("dist/mGSL.lemmatized.lst");
for await (const line of getLineStream(file)) {
  const [lemma, _freq] = line.split("\t");
  if (lemma.length == 1 && lemma != "a") {
    console.log("[a-z]\t" + line);
  } else if (filterOriginal.has(lemma)) {
    console.log("[filterOriginal]\t" + line);
  } else if (filterNumbers.has(lemma)) {
    console.log("[filterNumbers]\t" + line);
  } else if (original.has(lemma)) {
    dict.push(lemma + "," + original.get(lemma));
  } else {
    if (original.has(lemma)) {
      dict.push(lemma + "," + original.get(lemma));
    } else if (badWords.has(lemma)) {
      console.log("[badWords]\t" + line);
    } else if (profanityWords.has(lemma)) {
      console.log("[profanityWords]\t" + line);
    } else if (filterChemicals.has(lemma)) {
      console.log("[filterChemicals]\t" + line);
    } else if (abbrevs.has(lemma)) {
      console.log("[abbrevs]\t" + line);
    } else if (langs.has(lemma)) {
      console.log("[languages]\t" + line);
    } else if (countries.has(lemma)) {
      console.log("[countries]\t" + line);
    } else if (cities.has(lemma)) {
      console.log("[cities]\t" + line);
    } else if (names.has(lemma)) {
      console.log("[names]\t" + line);
    } else {
      console.log("[Japanese not found]\t" + line);
    }
  }
}
const enDict = dict.map((def) => {
  const [lemma, ja] = def.split(",");
  const jaArr = ja.split("|").filter((jaDef) => {
    if (!jaDef.includes("〈")) return true;
    if (jaDef.includes("英語〉")) return true;
    return false;
  });
  if (jaArr.length === 0) return false;
  return `${lemma},${jaArr.join("|")}`;
}).filter((def) => def);
Deno.writeTextFileSync("dist/mGSL.en.csv", enDict.join("\n"));
Deno.writeTextFileSync("dist/mGSL.csv", dict.join("\n"));
