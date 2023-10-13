import { readLines } from "https://deno.land/std/io/mod.ts";
import * as CSV from "https://deno.land/std/encoding/csv.ts";

function atoz() {
  const result = [];
  const first = "a", last = "z";
  for (let i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
    result.push(String.fromCharCode(i));
  }
  return result;
}

async function loadLineDict(filepath) {
  const dict = new Map();
  const fileReader = await Deno.open(filepath);
  for await (const lemma of readLines(fileReader)) {
    if (!lemma) continue;
    dict.set(lemma, true);
  }
  return dict;
}

function loadFilterNGSL() {
  return loadLineDict("filter-ngsl.lst");
}

async function loadFilterOriginal() {
  const filterOriginal = new Map();
  const fileReader = await Deno.open("filter-original.lst");
  for await (const en of readLines(fileReader)) {
    if (!en) continue;
    filterOriginal.set(en, true);
    filterOriginal.set(en.toLowerCase(), true);
  }
  return filterOriginal;
}

async function loadOriginal() {
  const original = new Map();
  const fileReader = await Deno.open("def.tsv");
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const [en, ja] = line.split("\t");
    original.set(en, ja);
  }
  return original;
}

async function loadBasicDict() {
  const basicDict = new Map();
  const filepaths = [
    "vendor/ngsl/ngsl.tsv",
    "vendor/ngsl/nawl.tsv",
    "vendor/ngsl/bsl.tsv",
    "vendor/ngsl/toeic.tsv",
  ];
  for (const filepath of filepaths) {
    const fileReader = await Deno.open(filepath);
    for await (const line of readLines(fileReader)) {
      if (!line) continue;
      const row = line.split("\t");
      const en = row[0];
      const ja = row[14].replace(/…/g, "〜").split(/\s*[,;]\s*/).join("|");
      if (ja != "N/A") {
        basicDict.set(en, ja);
      }
    }
  }
  return basicDict;
}

async function loadBooqs() {
  const booqs = new Map();
  const filepaths = [
    "vendor/booqs/NGSL.csv",
    "vendor/booqs/NAWL.csv",
    "vendor/booqs/BSL.csv",
    "vendor/booqs/TSL.csv",
  ];
  for (const filepath of filepaths) {
    const csv = Deno.readTextFileSync(filepath);
    const data = await CSV.parse(csv);
    data.forEach((row) => {
      const en = row[0];
      const ja = row[1]
        .replace(/【[^【]*】/g, "；")
        .split(/\s*[；，/]\s*/)
        .filter((s) => s != "").join("|");
      booqs.set(en, ja);
    });
  }
  return booqs;
}

async function loadLemmatizationDict() {
  const lemmatizationDict = new Map();
  lemmatizationDict.set("an", "a");
  const fileReader = await Deno.open("vendor/agid-2016.01.19/infl.txt");
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
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

async function loadAnc() {
  const anc = new Map();
  const fileReader = await Deno.open("vendor/anc.tsv");
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const row = line.split("\t");
    const en = row[0];
    if (!en.match(/^[A-Z]+$/)) {
      let arr = row[4]
        .replace(/\(cf.*\)/g, "")
        .replace(/\(ex.*\)/g, "")
        .split(/\s*[.,]\s*/)
        .filter((str) => str != "");
      if (
        !["two", "three", "four", "five", "six", "seven", "eight", "nine"]
          .includes(en)
      ) {
        arr = arr.filter((str) => !str.match(/^[1-9]$/));
      }
      if (arr.length == 1 && arr[0].includes("人名")) {
        filterOriginal[en] = true;
      } else {
        const ja = arr.join("|");
        anc.set(en, ja);
      }
    }
  }
  return anc;
}

async function loadEjdict(lemmatizationDict) {
  const ejdict = new Map();
  for (const alphabet of atoz()) {
    const fileReader = await Deno.open(`vendor/EJDict/src/${alphabet}.txt`);
    for await (const line of readLines(fileReader)) {
      if (!line) continue;
      let [en, ja] = line.split("\t");
      if (!ejdict.has(en)) {
        // 過去形などのノイズを消す (消しすぎてしまうが仕方ない)
        if (!lemmatizationDict.has(en)) {
          ja = ja.replace(/…/g, "〜").split(/\s*[,/]\s*/).join("|");
          ejdict.set(en, ja);
        }
      }
    }
  }
  return ejdict;
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
    const fileReader = await Deno.open(dict);
    for await (const lemma of readLines(fileReader)) {
      if (!lemma) continue;
      names.set(lemma.toLowerCase(), true);
    }
  }
  return names;
}

async function loadLangs() {
  const langs = new Map();
  const fileReader = await Deno.open(
    "vendor/language-list/data/en/language.csv",
  );
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const [lang1, lang2] = line.split(",");
    langs.set(lang1, true);
    langs.set(lang2, true);
    langs.set(lang2.toLowerCase(), true);
  }
  return langs;
}

async function loadCountries() {
  const countries = new Map(); // 省略名だけ登録
  const fileReader = await Deno.open(
    "vendor/language-list/data/en/language.csv",
  );
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const [country1, _country2] = line.split(",");
    countries.set(country1, true);
    countries.set(country1.toLowerCase(), true);
  }
  return countries;
}

async function loadCities() {
  const cities = new Map();
  const fileReader = await Deno.open(
    "vendor/world-cities/data/world-cities.csv",
  );
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
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
  const fileReader = await Deno.open("chemicals.tsv");
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
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
  const fileReader = await Deno.open("vendor/Abbreviations/sources.txt");
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    const lemma = line.split(" ")[1].toLowerCase();
    abbrevs.set(lemma, true);
  }
  return abbrevs;
}

const filterNGSL = await loadFilterNGSL();
const filterOriginal = await loadFilterOriginal();
const original = await loadOriginal();
const basicDict = await loadBasicDict();
const booqs = await loadBooqs();
const lemmatizationDict = await loadLemmatizationDict();
const anc = await loadAnc();
const ejdict = await loadEjdict(lemmatizationDict);
const badWords = await loadBadWords();
const profanityWords = await loadProfanityWords();
const names = await loadNames();
const langs = await loadLangs();
const countries = await loadCountries();
const cities = await loadCities();
const chemicals = await loadChemicals();
const abbrevs = await loadAbbrevs();

const websters = JSON.parse(
  await Deno.readTextFile("vendor/dictionary/dictionary.json"),
);

let tsv = "";
const fileReader = await Deno.open("dist/mGSL.lemmatized.lst");
for await (const line of readLines(fileReader)) {
  const [lemma, _freq] = line.split("\t");
  if (lemma.length == 1 && lemma != "a") {
    console.log("[a-z]\t" + line);
  } else if (filterOriginal.has(lemma)) {
    console.log("filterOriginal\t" + line);
  } else if (filterNGSL.has(lemma)) {
    console.log("filterNGSL\t" + line);
  } else if (original.has(lemma)) {
    tsv += lemma + "\t" + original.get(lemma) + "\t" + "original" + "\n";
  } else if (anc.has(lemma)) {
    tsv += lemma + "\t" + anc.get(lemma) + "\t" + "anc" + "\n";
  } else if (booqs.has(lemma)) {
    tsv += lemma + "\t" + booqs.get(lemma) + "\t" + "booqs" + "\n";
  } else if (basicDict.has(lemma)) {
    tsv += lemma + "\t" + basicDict.get(lemma) + "\t" + "basic" + "\n";
  } else {
    if (original.has(lemma)) {
      tsv += lemma + "\t" + original.get(lemma) + "\t" + "original" + "\n";
    } else if (badWords.has(lemma)) {
      console.log("badWords\t" + line);
    } else if (profanityWords.has(lemma)) {
      console.log("profanityWords\t" + line);
    } else if (chemicals.has(lemma)) {
      console.log("chemicals\t" + line);
    } else if (anc.has(lemma)) {
      tsv += lemma + "\t" + anc.get(lemma) + "\t" + "anc" + "\n";
    } else if (abbrevs.has(lemma)) { // 以下は anc のほうが精度が高い
      console.log("abbrevs\t" + line);
    } else if (langs.has(lemma)) {
      console.log("languages\t" + line);
    } else if (countries.has(lemma)) {
      console.log("countries\t" + line);
    } else if (cities.has(lemma)) {
      console.log("cities\t" + line);
    } else if (names.has(lemma)) {
      console.log("names\t" + line);
    } else if (booqs.has(lemma)) {
      tsv += lemma + "\t" + booqs.get(lemma) + "\t" + "booqs" + "\n";
    } else if (basicDict.has(lemma)) {
      tsv += lemma + "\t" + basicDict.get(lemma) + "\t" + "basic" + "\n";
    } else if (ejdict.has(lemma)) {
      tsv += lemma + "\t" + ejdict.get(lemma) + "\t" + "ejdict" + "\n";
    } else if (lemma in websters) {
      let def = websters[lemma].replace(/\n/g, " ");
      def = def.split(/;\s*/).join("|");
      tsv += lemma + "\t" + def + "\t" + "websters" + "\n";
    } else {
      console.log("Japanese not found\t" + line);
    }
  }
}
Deno.writeTextFileSync("dist/mGSL.lst", tsv);
