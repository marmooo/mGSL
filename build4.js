const readEachLineSync = require('read-each-line-sync');

const ecdict = {};
readEachLineSync('ECDICT/ecdict.csv', 'utf8', (line) => {
  const lemma = line.split(',', 1)[0];
  ecdict[lemma] = true;
});

let promises = []
readEachLineSync('3/mGSL.lst', 'utf8', (line) => {
  let [lemma, count] = line.split('\t');
  if (lemma in ecdict) {
    console.log(line);
  }
});

