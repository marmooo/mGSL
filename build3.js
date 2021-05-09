const readEachLineSync = require('read-each-line-sync');

const dict = { an:'a' };
readEachLineSync('agid-2016.01.19/infl.txt', 'utf8', (line) => {
  const [toStr, fromStr] = line.split(': ');
  if (!toStr.includes('?')) {
    const [to, toPos] = toStr.split(' ');
    let froms = [];
    fromStr.split(' | ').forEach(forms => {
      forms.split(', ').forEach(entry => {
        if (!entry.match(/[~<!?]/)) {
          const word = entry.split(' ')[0];
          froms.push(word);
        }
      });
    });
    froms.forEach(from => {
      dict[from] = to;
    });
  }
});

const gsl = {};
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
