const SQLite3 = require('better-sqlite3');
const db = new SQLite3(__dirname + '/wnjpn.db');
const readEachLineSync = require('read-each-line-sync');


const getWordsEngStmt1 = db.prepare("SELECT * FROM word WHERE lemma = ?");
// const getSensesEngStmt1 = db.prepare("SELECT * FROM sense WHERE wordid = ? ORDER BY freq");
const getSensesEngStmt1 = db.prepare("SELECT synset FROM sense WHERE wordid = ? AND freq = (SELECT max(freq) FROM sense WHERE wordid = ?)");
const getSensesEngStmt2 = db.prepare("SELECT distinct wordid FROM sense WHERE synset = ? AND lang='eng' ORDER BY freq DESC LIMIT 10");
const getWordsEngStmt2 = db.prepare("SELECT lemma FROM word WHERE wordid = ?");
const getDefEngStmt = db.prepare("SELECT def FROM synset_def WHERE synset = ? AND lang='eng'");

function isUnnecessary(lexName) {
  switch (lexName) {
    case 'noun.person': return true;
    case 'noun.location': return true;
    default: return false;
  }
}

function getWordsEng(lemma) {
  let defs = [];
  let synonyms = [];
  getWordsEngStmt1.all(lemma).forEach(wordEng1 => {
    // getSensesEngStmt1.all(wordEng1.wordid).forEach(senseEng1 => {
    getSensesEngStmt1.all(wordEng1.wordid, wordEng1.wordid).forEach(senseEng1 => {
      getDefEngStmt.all(senseEng1.synset).forEach(synsetDef => {
        defs.push(synsetDef.def);
      });
      // getSensesEngStmt2.all(senseEng1.synset).forEach(senseEng2 => {
      //   getWordsEngStmt2.all(senseEng2.wordid).forEach(wordEng2 => {
      //     synonyms.push(wordEng2);
      //   });
      // });
    });
  });
  return [defs, synonyms];
}

function uniq(array) {
  return [...new Set(array)];
}

readEachLineSync('mGSL.lst', 'utf8', (line) => {
  const [lemma, freq] = line.split('\t');
  const [defs, words] = getWordsEng(lemma);
  // if (words.length != 0) {
  //   const defString = defs.join(',');
  //   const lemmaString = words.map(x => x.lemma).filter(x => x != lemma).join(',');
  //   if (lemmaString != '') {
  //     // console.log(lemma + '\t' + defString + '\t' + lemmaString);
  //     console.log(lemma + '\t' + lemmaString);
  //   }
  // }
  if (defs.length != 0) {
    const defString = uniq(defs).join('|');
    console.log(lemma + '\t' + defString);
  }
});
