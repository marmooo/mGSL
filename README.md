# mGSL
marmooo's General Service List (English).
mGSL provides a huge list with less noise and accurate statistics.

## Demo
- [E3](https://marmooo.github.io/e3/) (mGSL based English vocabulary training app)

## Installation
1. ```npm install```
2. install [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT) licensed under the MIT
3. install [kujirahand/EJDICT](https://github.com/kujirahand/EJDict) licensed under the [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
4. install [datasets/world-cities](https://github.com/datasets/world-cities) licensed under the [CC-BY 3.0](http://creativecommons.org/licenses/by/3.0/)
5. install [smashew/NameDatabases](https://github.com/smashew/NameDatabases) licensed under the Unlicense
6. install [日本語 WordNet](http://compling.hss.ntu.edu.sg/wnja/) from [SQLite3 Database](http://compling.hss.ntu.edu.sg/wnja/data/1.1/wnjpn.db.gz) licensed under the [Japanese WordNet License](http://compling.hss.ntu.edu.sg/wnja/license.txt) and [WordNet 3.0 License](https://wordnet.princeton.edu/license-and-commercial-use)
7. install [adambom/dictionary](https://github.com/adambom/dictionary) licensed under the MIT and  [Project Gutenberg License](http://www.gutenberg.org/policy/license.html)

## Build
1. Choose datasets.
   1. [Peter Norvig's](http://norvig.com/ngrams/) compilation of the [1/3 million most frequent English words](http://norvig.com/ngrams/count_1w.txt) licenced under the MIT (recommended)
   2. [Google n-gram](http://storage.googleapis.com/books/ngrams/books/datasetsv2.html) licensed under the [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)

2. Generate frequency list when you choose Google n-gram.
```
bash build1.sh    # preprocessing
node build2.js    # generate frequency list
```

3. clenup list
```
node build3.js    # remove noise & lemmatization
node build4.js    # remove unknown words
```

4. cleanup & generate en-ja list
```
node wnjpn.js > wnjpn.txt
node wneng.js > wneng.txt
node build5.js  # remove proper noun and generate en-ja list
```

## License
CC-BY-SA 4.0

## Attribution
- The original of ja/booqs/*.csv were created by [BooQs](https://note.com/kawanjin01/n/na861d9264699) under the license of [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- The original of ja/ngsl/*.tsv were created by [NGSL](http://www.newgeneralservicelist.org/) under the license of [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
