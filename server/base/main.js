//ファイルインポート
const { BoardData, Board } = require("./functions/class");

//計算時間測定関数の定義
const measureStart = (value = 1000) => {
    console.log("測定を開始します");
    accuracy = value;
    const start = performance.now();
}

const measureFinish = () => {
    const end = performance.now();
    result = (Math.round((end - start) * accuracy) / (1000 * accuracy));
}

let accuracy = 0, start = 0, result = null;

/* メモリ強化版
 * node --max-old-space-size=32000 main.js
 */

/*コピペでファイル実行
cd ./server/base
node main.js
*/

//実行内容

const boardData = new BoardData(null, 10, 10);
//console.log(boardData.answer.order[0].board.array);

console.log("一致数:"+boardData.answer.matchValue);

measureStart();

boardData.answer.allSort();

measureFinish();

console.log("一致数:"+boardData.answer.matchValue);

console.log("合計手数:"+boardData.answer.orderLength);

//測定結果表示
console.log("計算時間=" + result + "秒");