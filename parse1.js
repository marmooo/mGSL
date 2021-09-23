import { readLines } from "https://deno.land/std/io/mod.ts";

// 古い言葉は使われ方が異なるので最新の 2008 だけを見る
// データ量が多いので頻度が 100 以下は無視する
const inputFile = Deno.args[0];
const fileReader = await Deno.open(inputFile);
for await (const line of readLines(fileReader)) {
  const arr = line.split("\t");
  const count = arr[2];
  if (arr[1] == "2008" && count.length >= 3) {
    if (!arr[0].includes("_")) { // 明らかにスペースを繋げている語句は無視
      console.log(line);
    }
  }
}
