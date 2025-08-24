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

function loadfilterNumbers() {
  return loadLineDict("filter-numbers.lst");
}

async function loadFilterOriginal() {
  const filterOriginal = new Map();
  const file = await Deno.open("filter-original.lst");
  for await (const en of getLineStream(file)) {
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

async function loadLemmatizationDict() {
  const lemmatizationDict = new Map();
  lemmatizationDict.set("an", "a");
  const file = await Deno.open("vendor/agid-2016.01.19/infl.txt");
  for await (const line of getLineStream(file)) {
    const [toStr, fromStr] = line.split(": ");
    if (!toStr.endsWith("?")) {
      const [to, _toPos] = toStr.split(" ");
      const froms = [];
      fromStr.split(" | ").forEach((forms) => {
        forms.split(", ").forEach((entry) => {
          const word = entry.split(/[~<!? ]/)[0];
          froms.push(word);
        });
      });
      froms.forEach((from) => {
        lemmatizationDict.set(from, to);
      });
    }
  }
  lemmatizationDict.delete("danger");
  return lemmatizationDict;
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

async function loadChemicals() {
  const chemicals = new Map();
  const file = await Deno.open("chemicals.tsv");
  for await (const line of getLineStream(file)) {
    const lemma = line.split("\t")[0].toLowerCase();
    chemicals.set(lemma, true);
  }
  chemicals.delete("he");
  chemicals.delete("os");
  return chemicals;
}

async function loadAbbrevs() {
  // 省略形は複数の原形を持つため、lemmatization と同様に扱うと統計値がずれる
  // oct, nov など頻度の高いものも削除されるので注意は必要
  const abbrevs = new Map();
  const file = await Deno.open("vendor/Abbreviations/sources.txt");
  for await (const line of getLineStream(file)) {
    const lemma = line.split(" ")[1].toLowerCase();
    abbrevs.set(lemma, true);
  }
  return abbrevs;
}

const filterNumbers = await loadfilterNumbers();
const filterOriginal = await loadFilterOriginal();
const original = await loadOriginal();
const lemmatizationDict = await loadLemmatizationDict();
const badWords = await loadBadWords();
const profanityWords = await loadProfanityWords();
const names = await loadNames();
const langs = await loadLangs();
const countries = await loadCountries();
const cities = await loadCities();
const chemicals = await loadChemicals();
const abbrevs = await loadAbbrevs();

let tsv = "";
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
    tsv += lemma + "\t" + original.get(lemma) + "\t" + "original" + "\n";
  } else {
    if (original.has(lemma)) {
      tsv += lemma + "\t" + original.get(lemma) + "\t" + "original" + "\n";
    } else if (badWords.has(lemma)) {
      console.log("[badWords]\t" + line);
    } else if (profanityWords.has(lemma)) {
      console.log("[profanityWords]\t" + line);
    } else if (chemicals.has(lemma)) {
      console.log("[chemicals]\t" + line);
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
Deno.writeTextFileSync("dist/mGSL.lst", tsv);
