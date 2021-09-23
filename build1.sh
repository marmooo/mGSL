for x in {a..z}
do
  filename=googlebooks-eng-all-1gram-20120701-${x}
  wget http://storage.googleapis.com/books/ngrams/books/${filename}.gz
  gzip -d ${filename}.gz
  deno run --allow-read parse1.js ${filename} > 1/${x}.lst
  rm ${filename}
done
