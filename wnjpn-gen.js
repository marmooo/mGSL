import { readLines } from "https://deno.land/std/io/mod.ts";
import { DB } from "./deps.ts";

const db = new DB("vendor/wnjpn.db");
const getWordsEngStmt1 = db.prepareQuery(
  "SELECT wordid FROM word WHERE lemma = ?",
);
// const getSensesEngStmt1 = db.prepareQuery("SELECT wordid FROM sense WHERE wordid = ? ORDER BY freq");
// const getSensesEngStmt1 = db.prepareQuery(
//   "SELECT synset FROM sense WHERE wordid = ? AND freq = (SELECT max(freq) FROM sense WHERE wordid = ?)",
// );
const getSensesEngStmt1 = db.prepareQuery(
  "SELECT synset FROM sense WHERE wordid = ?",
);
const getSensesEngStmt2 = db.prepareQuery(
  "SELECT distinct wordid FROM sense WHERE synset = ? AND lang='jpn' ORDER BY freq",
);
const getWordsEngStmt2 = db.prepareQuery(
  "SELECT lemma FROM word WHERE wordid = ?",
);
// const getDefEngStmt = db.prepareQuery("SELECT def FROM synset_def WHERE synset = ? AND lang='jpn'");

function getWordsEng(synset) {
  const defs = [];
  const synonyms = [];
  for (const [wordid2] of getSensesEngStmt2.all([synset])) {
    for (const [lemma] of getWordsEngStmt2.all([wordid2])) {
      synonyms.push(lemma);
    }
  }
  return [defs, synonyms];
}

const synsets = db.query(
  "SELECT synset FROM sense WHERE lang = 'jpn'",
);
for (const [synset] of synsets) {
  const [_defs, words] = getWordsEng(synset);
  if (words.length > 1) {
    const lemmaString = words.join("|");
    console.log(lemmaString);
  }
}
