import { readLines } from "https://deno.land/std/io/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("vendor/wnjpn.db");
const getWordsEngStmt1 = db.prepareQuery(
  "SELECT wordid FROM word WHERE lemma = ?",
);
// const getSensesEngStmt1 = db.prepareQuery("SELECT wordid FROM sense WHERE wordid = ? ORDER BY freq");
const getSensesEngStmt1 = db.prepareQuery(
  "SELECT synset FROM sense WHERE wordid = ? AND freq = (SELECT max(freq) FROM sense WHERE wordid = ?)",
);
const getSensesEngStmt2 = db.prepareQuery(
  "SELECT distinct wordid FROM sense WHERE synset = ? AND lang='jpn' ORDER BY freq DESC LIMIT 10",
);
const getWordsEngStmt2 = db.prepareQuery(
  "SELECT lemma FROM word WHERE wordid = ?",
);
// const getDefEngStmt = db.prepareQuery("SELECT def FROM synset_def WHERE synset = ? AND lang='jpn'");

function getWordsEng(lemma) {
  const defs = [];
  const synonyms = [];
  for (const [wordid1] of getWordsEngStmt1([lemma])) {
    // for ([wordid1] of getSensesEngStmt1(wordid1)) {
    for (const [synset1] of getSensesEngStmt1([wordid1, wordid1])) {
      // for (const [def] of getDefEngStmt([synset1])) {
      //   defs.push(def);
      // }
      for (const [wordid2] of getSensesEngStmt2([synset1])) {
        for (const [lemma] of getWordsEngStmt2([wordid2])) {
          synonyms.push(lemma);
        }
      }
    }
  }
  return [defs, synonyms];
}

const fileReader = await Deno.open("3/mGSL.lst");
for await (const line of readLines(fileReader)) {
  const [lemma, _freq] = line.split("\t");
  const [_defs, words] = getWordsEng(lemma);
  if (words.length != 0) {
    // const defString = defs.join('|');
    const lemmaString = words.filter((x) => x != lemma).join("|");
    // console.log(lemma + '\t' + defString + '\t' + lemmaString);
    console.log(lemma + "\t" + lemmaString);
  }
}
