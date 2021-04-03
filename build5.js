const fs = require('fs');
const readEachLineSync = require('read-each-line-sync');

function atoz(callback) {
  const first = "a", last = "z";
  for(var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
    callback(String.fromCharCode(i));
  }
}

const original = {};
readEachLineSync('def.csv', 'utf8', (line) => {
  const [en, ja] = line.split(',');
  original[en] = ja;
});

const basicDict = {};
const basicFilepaths = ['ja/ngsl/ngsl.tsv', 'ja/ngsl/nawl.tsv', 'ja/ngsl/bsl.tsv', 'ja/ngsl/toeic.tsv'];
basicFilepaths.forEach(filepath => {
  readEachLineSync(filepath, 'utf8', (line) => {
    const row = line.split('\t');
    const en = row[0];
    const ja = row[14].split(/\s*[,;]\s*/).join('|');
    if (ja != 'N/A') {
      basicDict[en] = ja;
    }
  });
});

const booqs = {};
const booqsFilepaths = ['ja/booqs/NGSL.csv', 'ja/booqs/NAWL.csv', 'ja/booqs/BSL.csv', 'ja/booqs/TSL.csv'];
booqsFilepaths.forEach(filepath => {
  readEachLineSync(filepath, 'utf8', (line) => {
    const row = line.split(',');
    const en = row[0];
    const ja = row[1].split(/[；，]/).join('|');
    booqs[en] = ja;
  });
});

const wnjpn = {};
readEachLineSync('wnjpn.txt', 'utf8', (line) => {
  const [en, ja] = line.split('\t');
  wnjpn[en] = ja;
});

const ejdict = {};
atoz(alphabet => {
  readEachLineSync(`EJDict/src/${alphabet}.txt`, 'utf8', (line) => {
    const [en, ja] = line.split('\t');
    if (en in ejdict === false) {
      ejdict[en] = ja.split(',').join('|');
    }
  });
});


const names = {};
readEachLineSync('NameDatabases/NamesDatabases/surnames/all.txt', 'utf8', (line) => {
  const lemma = line.toLowerCase();
  names[lemma] = true;
});
readEachLineSync('NameDatabases/NamesDatabases/first names/all.txt', 'utf8', (line) => {
  const lemma = line.toLowerCase();
  names[lemma] = true;
});

const cities = {};
readEachLineSync('world-cities/data/world-cities.csv', 'utf8', (line) => {
  const row = line.split(',');
  const city = row[0].toLowerCase();
  const country = row[1].toLowerCase();
  cities[city] = true;
  cities[country] = true;
});
delete cities['name'];
delete cities['country'];

const wneng = {};
readEachLineSync('wneng.txt', 'utf8', (line) => {
  const [en, ja] = line.split('\t');
  wneng[en] = ja;
});

const websters = JSON.parse(fs.readFileSync('dictionary/dictionary.json'));


readEachLineSync('4/mGSL.lst', 'utf8', (line) => {
  const [lemma, freq] = line.split('\t');
  if (lemma in original) {
    console.log(lemma + '\t' + original[lemma] + '\t' + 'original');
  } else if (lemma in basicDict) {
    console.log(lemma + '\t' + basicDict[lemma] + '\t' + 'basic');
  } else if (lemma in booqs) {
    console.log(lemma + '\t' + booqs[lemma] + '\t' + 'booqs');
  } else {
    if (lemma in names) {
      // console.log(line);
    } else if (lemma in cities) {
      // console.log(line);
    } else if (lemma in wnjpn) {
      console.log(lemma + '\t' + wnjpn[lemma] + '\t' + 'wnjpn');
    } else if (lemma in ejdict) {
      console.log(lemma + '\t' + ejdict[lemma] + '\t' + 'ejdict');
    } else if (lemma in wneng) {
      console.log(lemma + '\t' + wneng[lemma] + '\t' + 'wneng');
    } else if (lemma.toUpperCase() in websters) {
      let def = websters[lemma.toUpperCase()].replace(/\n/g, ' ');
      def = def.split(/;\s*/).join('|');
      console.log(lemma + '\t' + def + '\t' + 'websters');
    } else {
      // console.log(line);
    }
  }
});

