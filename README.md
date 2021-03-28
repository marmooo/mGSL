# mGSL
marmooo's General Service List (English).
mGSL provides a huge list with less noise and accurate statistics.

## Demo
- [E3](https://marmooo.github.io/e3/) (mGSL based English vocabulary training app)

## Installation
1. ```npm install```
2. install [skywind3000/ECDICT](https://github.com/skywind3000/ECDICT)

## Build
1. Choose datasets.
   1. [Peter Norvig's](http://norvig.com/ngrams/) compilation of the [1/3 million most frequent English words](http://norvig.com/ngrams/count_1w.txt) (recommended)
   2. [Google n-gram](http://storage.googleapis.com/books/ngrams/books/datasetsv2.html)

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

## License
CC-BY-SA 4.0

