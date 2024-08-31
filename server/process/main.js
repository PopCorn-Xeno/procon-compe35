//ファイルインポート
const { BoardData, Board } = require("./functions/class");
const fs = require('fs');
const { inspect } = require("util");

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
    fs.writeFile('./process/log/performance.txt', JSON.stringify(measureResult, undefined, ' '), 'utf-8', (err) => { });
    fs.writeFile('./process/log/orderLength.txt', JSON.stringify(measureOrderLength, undefined, ' '), 'utf-8', (err) => { });
}

function fullLog(data) {
    console.log(inspect(data, { maxArrayLength: null }));
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

const boardData = new BoardData(null, null, 256, 256);

console.log("一致数:" + boardData.answer.countMatchValue());

measureStart();

boardData.answer.allSort();

measureFinish();

console.log("一致数:" + boardData.answer.countMatchValue());

console.log("合計手数:" + boardData.answer.turn);

//測定結果表示
console.log("計算時間=" + result + "秒");

// fullLog(boardData.answer.current.array);