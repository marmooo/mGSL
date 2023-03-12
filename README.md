# mGSL

marmooo's General Service List (English). mGSL provides a huge list with less
noise and accurate statistics.

## Demo

- [Vocabee](https://marmooo.github.io/vocabee/) (mGSL based English vocabulary
  training app)
- [graded-enja-corpus](https://github.com/marmooo/graded-enja-corpus)

## Installation

- install
  [marmooo/google-ngram-small-en](https://github.com/marmooo/google-ngram-small-en)
  licensed under the
  [CC-BY-4.0](https://github.com/marmooo/google-ngram-small-en/blob/main/LICENSE)
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
- install [adambom/dictionary](https://github.com/adambom/dictionary) licensed
  under the MIT and
  [Project Gutenberg License](http://www.gutenberg.org/policy/license.html)
- install [umpirsky/country-list](https://github.com/umpirsky/country-list)
  licensed under the MIT
- install [umpirsky/language-list](https://github.com/umpirsky/language-list)
  licensed under the MIT

## Build

1. `bash install.sh`
2. `deno run --allow-read --allow-write build1.js` # listup
3. `deno run --allow-read --allow-write build2.js` # lemmatization
4. `deno run --allow-read --allow-write build3.js` # remove bad words

## License

CC-BY-SA 4.0

## Attribution

- `vendor/ancdic.tsv` is modified
  [ANC Frequency Dictionary](http://www.jamsystem.com/ancdic/)
- `vendor/booqs/*.csv` are [BooQs](https://note.com/kawanjin01/n/na861d9264699)
  licensed under the
  [CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- `vendor/ngsl/*.xlsx` are [NGSL](http://www.newgeneralservicelist.org/)
  licensed under the
  [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
