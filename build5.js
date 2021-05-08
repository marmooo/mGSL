const fs = require('fs');
const csvParse = require('csv-parse/lib/sync');
const readEachLineSync = require('read-each-line-sync');

function atoz(callback) {
  const first = "a", last = "z";
  for(var i = first.charCodeAt(0); i <= last.charCodeAt(0); i++) {
    callback(String.fromCharCode(i));
  }
}

const filterNGSL = {};
readEachLineSync('filter-ngsl.lst', 'utf8', (en) => {
  filterNGSL[en] = true;
});

const filterOriginal = {};
readEachLineSync('filter-original.lst', 'utf8', (en) => {
  filterOriginal[en] = true;
});

const original = {};
readEachLineSync('def.tsv', 'utf8', (line) => {
  const [en, ja] = line.split('\t');
  original[en] = ja;
});

const basicDict = {};
const basicFilepaths = ['ja/ngsl/ngsl.tsv', 'ja/ngsl/nawl.tsv', 'ja/ngsl/bsl.tsv', 'ja/ngsl/toeic.tsv'];
basicFilepaths.forEach(filepath => {
  readEachLineSync(filepath, 'utf8', (line) => {
    const row = line.split('\t');
    const en = row[0];
    const ja = row[14].replace(/…/g, '〜').split(/\s*[,;]\s*/).join('|');
    if (ja != 'N/A') {
      basicDict[en] = ja;
    }
  });
});

const booqs = {};
const booqsFilepaths = ['ja/booqs/NGSL.csv', 'ja/booqs/NAWL.csv', 'ja/booqs/BSL.csv', 'ja/booqs/TSL.csv'];
booqsFilepaths.forEach(filepath => {
  const csv = csvParse(fs.readFileSync(filepath));
  csv.forEach(row => {
    const en = row[0];
    const ja = row[1]
      .replace(/【[^【]*】/g, '；')
      .split(/\s*[；，/]\s*/)
      .filter(s => s != '').join('|');
    booqs[en] = ja;
  });
});

const lemmatizationDict = { constructor:'constructor' };  // Node.js bug?
readEachLineSync('ECDICT/lemma.en.txt', 'utf8', (line) => {
  let [to, froms] = line.split(' -> ');
  if (froms) {
    to = to.split('/')[0];
    froms.split(',').forEach(from => {
      lemmatizationDict[from] = to;
    });
  }
});
delete lemmatizationDict['miss'];

const anc = {};
readEachLineSync('anc.tsv', 'utf8', (line) => {
  const row = line.split('\t');
  const en = row[0];
  if (!en.match(/^[A-Z]+$/)) {
    let arr = row[4]
      .replace(/\(cf.*\)/g, '')
      .replace(/\(ex.*\)/g, '')
      .split(/\s*[.,]\s*/)
      .filter(str => str != '');
    if (!['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'].includes(en)) {
      arr = arr.filter(str => !str.match(/^[1-9]$/));
    }
    if (arr.length == 1 && arr[0].includes('人名')) {
      filterOriginal[en] = true;
    } else {
      const ja = arr.join('|');
      anc[en] = ja;
    }
  }
});
delete anc['x'];
delete anc['p'];
delete anc['j'];

const ejdict = {};
atoz(alphabet => {
  readEachLineSync(`EJDict/src/${alphabet}.txt`, 'utf8', (line) => {
    let [en, ja] = line.split('\t');
    if (en in ejdict === false) {
      // 過去形などのノイズを消す (消しすぎてしまうが仕方ない)
      if (en in lemmatizationDict === false) {
        ejdict[en] = ja.replace(/…/g, '〜').split(/\s*[,/]\s*/).join('|');
      }
    }
  });
});

const badWords = {};
readEachLineSync('List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/en', 'utf8', (lemma) => {
  badWords[lemma] = true;
});

const profanityWords = {};
readEachLineSync('Google-profanity-words/list.txt', 'utf8', (lemma) => {
  profanityWords[lemma] = true;
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

const chemicals = {};
readEachLineSync('chemicals.tsv', 'utf8', (line) => {
  const lemma = line.split('\t')[0].toLowerCase();
  chemicals[lemma] = true;
});
delete chemicals['he'];
delete chemicals['os'];  // 骨

// 省略形は複数の原形を持つため、lemmatization と同様に扱うと統計値がずれる
// oct, nov など頻度の高いものも削除されるので注意は必要
const abbrevs = {};
readEachLineSync('Abbreviations/sources.txt', 'utf8', (line) => {
  const lemma = line.split(' ')[1].toLowerCase();
  abbrevs[lemma] = true;
});

// 固有名詞のノイズが多い
const wnjpn = {};
readEachLineSync('wnjpn.txt', 'utf8', (line) => {
  const [en, ja] = line.split('\t');
  if (ja != '') {
    wnjpn[en] = ja;
  }
});

// 固有名詞のノイズが多い
const wneng = {};
readEachLineSync('wneng.txt', 'utf8', (line) => {
  const [en, ja] = line.split('\t');
  wneng[en] = ja;
});

const websters = JSON.parse(fs.readFileSync('dictionary/dictionary.json'));


readEachLineSync('4/mGSL.lst', 'utf8', (line) => {
  const [lemma, freq] = line.split('\t');
  if (lemma in filterOriginal) {
    // console.log(line);
  } else if (lemma in filterNGSL) {
    // console.log(line);
  } else if (lemma in booqs || lemma in basicDict) {
    if (lemma in original) {
      console.log(lemma + '\t' + original[lemma] + '\t' + 'original');
    } else if (lemma in anc) {
      console.log(lemma + '\t' + anc[lemma] + '\t' + 'anc');
    } else if (lemma in booqs) {
      console.log(lemma + '\t' + booqs[lemma] + '\t' + 'booqs');
    } else if (lemma in basicDict) {
      console.log(lemma + '\t' + basicDict[lemma] + '\t' + 'basic');
    }
  } else {
    if (lemma in original) {
      console.log(lemma + '\t' + original[lemma] + '\t' + 'original');
    } else if (lemma in badWords) {
      // console.log(line);
    } else if (lemma in profanityWords) {
      // console.log(line);
    } else if (lemma in chemicals) {
      // console.log(line);
    } else if (lemma in anc) {
      console.log(lemma + '\t' + anc[lemma] + '\t' + 'anc');
    } else if (lemma in abbrevs) {  // 以下は anc のほうが精度が高い
      // console.log(line);
    } else if (lemma in cities) {
      // console.log(line);
    } else if (lemma in names) {
      // console.log(line);
    } else if (lemma in booqs) {
      console.log(lemma + '\t' + booqs[lemma] + '\t' + 'booqs');
    } else if (lemma in basicDict) {
      console.log(lemma + '\t' + basicDict[lemma] + '\t' + 'basic');
    } else if (lemma in ejdict) {
      console.log(lemma + '\t' + ejdict[lemma] + '\t' + 'ejdict');
    } else if (lemma in wnjpn) {
      console.log(lemma + '\t' + wnjpn[lemma] + '\t' + 'wnjpn');
    } else if (lemma in websters) {
      let def = websters[lemma].replace(/\n/g, ' ');
      def = def.split(/;\s*/).join('|');
      console.log(lemma + '\t' + def + '\t' + 'websters');
    } else if (lemma in wneng) {
      console.log(lemma + '\t' + wneng[lemma] + '\t' + 'wneng');
    } else {
      // console.log(line);
    }
  }
});

