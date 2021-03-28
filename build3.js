const readEachLineSync = require('read-each-line-sync');

const dict = { constructor:'constructor' };  // Node.js bug?
readEachLineSync('ECDICT/lemma.en.txt', 'utf8', (line) => {
  let [to, froms] = line.split(' -> ');
  if (froms) {
    to = to.split('/')[0];
    froms.split(',').forEach(from => {
      dict[from] = to;
    });
  }
});

const gsl = { constructor:0 };
readEachLineSync('2/mGSL.lst', 'utf8', (line) => {
  let [lemma, count] = line.split('\t');
  count = parseInt(count);
  if (lemma in dict) {
    const newLemma = dict[lemma];
    if (newLemma in gsl) {
      gsl[newLemma] += count;
    } else {
      gsl[newLemma] = count;
    }
  } else {
    gsl[lemma] = count;
  }
});

const mgsl = Object.entries(gsl);
mgsl.sort((ax, bx) => {
  const a = ax[1], b = bx[1];
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
});
mgsl.forEach(x => {
  console.log(x[0] + '\t' + x[1]);
});
