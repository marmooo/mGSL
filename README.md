# mGSL

marmooo's General Service List (English). mGSL provides a huge list with less
noise and accurate statistics.

## Demo

- [Vocabee](https://marmooo.github.io/vocabee/) (mGSL based English vocabulary
  training app)

## Installation

- `npm install`
- install [AGID](http://wordlist.aspell.net/agid-readme/) licensed under the
  [AGID License](http://wordlist.aspell.net/agid-readme/)
- install [kujirahand/EJDICT](https://github.com/kujirahand/EJDict) licensed
  under the [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
- install [datasets/world-cities](https://github.com/datasets/world-cities)
  licensed under the [CC-BY 3.0](http://creativecommons.org/licenses/by/3.0/)
- install [smashew/NameDatabases](https://github.com/smashew/NameDatabases)
  licensed under the Unlicense
- install
  [LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)
  licensed under the [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- install
  [RobertJGabriel/Google-profanity-words](https://github.com/RobertJGabriel/Google-profanity-words)
  licensed under the
  [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
- install [fangpsh/Abbreviations](https://github.com/fangpsh/Abbreviations)
  licensed under the
  [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
- install [SQLite3 DB](http://compling.hss.ntu.edu.sg/wnja/data/1.1/wnjpn.db.gz)
  from [日本語 WordNet](http://compling.hss.ntu.edu.sg/wnja/) licensed under the
  [Japanese WordNet License](http://compling.hss.ntu.edu.sg/wnja/license.txt)
  and
  [WordNet 3.0 License](https://wordnet.princeton.edu/license-and-commercial-use)
- install [adambom/dictionary](https://github.com/adambom/dictionary) licensed
  under the MIT and
  [Project Gutenberg License](http://www.gutenberg.org/policy/license.html)
- install [umpirsky/country-list](https://github.com/adambom/dictionar) licensed
  under the MIT
- install [umpirsky/language-list](https://github.com/umpirsky/language-list)
  licensed under the MIT

## Build

1. Choose datasets.
   1. [Peter Norvig's](http://norvig.com/ngrams/) compilation of the
      [1/3 million most frequent English words](http://norvig.com/ngrams/count_1w.txt)
      licenced under the MIT (recommended)
   2. [Google n-gram](http://storage.googleapis.com/books/ngrams/books/datasetsv2.html)
      licensed under the
      [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/)

2. Generate frequency list when you choose Google n-gram.

```
bash build1.sh                   # preprocessing
deno run --allow-read build2.js  # generate frequency list
```

3. Cleanup

```
deno run --allow-read build3.js  # lemmatization
```

4. Generate en-ja list

```
deno run --allow-read --allow-write wnjpn.js > wnjpn.txt  # optional
deno run --allow-read --allow-write wneng.js > wneng.txt  # optional
deno run --allow-read build4.js  # remove bad words and generate en-ja list
```

## License

CC-BY-SA 4.0

## Attribution

- The original of vendor/ancdic.tsv was created by
  [ANC Frequency Dictionary](http://www.jamsystem.com/ancdic/) (free)
- The original of vendor/booqs/*.csv were created by
  [BooQs](https://note.com/kawanjin01/n/na861d9264699) under the license of
  [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- The original of vendor/ngsl/*.tsv were created by
  [NGSL](http://www.newgeneralservicelist.org/) under the license of
  [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
