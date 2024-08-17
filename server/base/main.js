//ファイルインポート
const { BoardData, Board } = require("./functions/class");
const fs = require('fs');

let accuracy = 0, start = 0, result = 0;

//計算時間測定関数の定義
const measureStart = (value = 10000) => {
    accuracy = value;
    start = performance.now();
}

const measureFinish = () => {
    let end = performance.now();
    result = (Math.round((end - start) * accuracy) / (1000 * accuracy));
}

//allSort関数の計算速度の計測
const measurePerformance = () => {
    let measureResult = [];
    let measureOrderLength = [];
    for (let i = 70; i < 125; i++) {
        console.log(i);
        let boardData = new BoardData(null, i, i);

        measureStart();

        boardData.answer.allSort();

        measureFinish();
        measureResult.push(result);
        measureOrderLength.push(boardData.answer.order.length);
    }
    fs.writeFile('./functions/log/performance.txt', JSON.stringify(measureResult, undefined, ' '), 'utf-8', (err) => { });
    fs.writeFile('./functions/log/orderLength.txt', JSON.stringify(measureOrderLength, undefined, ' '), 'utf-8', (err) => { });
}

/* メモリ強化版
 * node --max-old-space-size=32000 main.js
 */

/*コピペでファイル実行
cd ./server/base
node main.js
*/

//実行内容

//measurePerformance();

const boardData = new BoardData(null, 120, 120);

console.log("一致数:" + boardData.answer.matchValue());

measureStart();

boardData.answer.allSortAdvanced();

measureFinish();

console.log("一致数:" + boardData.answer.matchValue());

console.log("合計手数:" + boardData.answer.orderLength);

//測定結果表示
console.log("計算時間=" + result + "秒");