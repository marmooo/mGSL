const glob = require('glob');
const readEachLineSync = require('read-each-line-sync');
// const stemmer = require( 'wink-porter2-stemmer' );

const gTLD = /\.(com|net|org|edu|gov|mil|int|blz|info|name|pro|museum|aero|coop|jobs|travel|mobi|cat|tel|asia|post|xxx)/;
const gsl = { constructor:0 };  // TODO: Node.js bug?
glob.glob.sync('1/*.lst').reverse().forEach(filepath => {
  readEachLineSync(filepath, 'utf8', (line) => {
    const arr = line.toLowerCase().split('\t');
    const count = parseInt(arr[2]);
    const lemma = arr[0];
    if (lemma.match(/^[a-z]\.$/)) {
    } else if (lemma.match(/^[b-hj-z]$/)) {
    } else if (lemma.match(/^([a-z])\1{2,}\.?$/)) {
    } else if (lemma.match(/www\./)) {
    } else if (lemma.match(gTLD)) {
    } else if (!lemma.match(/[^a-z.]/)) {
      // lemma = stemmer(lemma);
      if (gsl[lemma]) {
        gsl[lemma] += count;
      } else {
        gsl[lemma] = count;
      }
    }
  });
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
