const { BoardData } = require("./functions/class");
const { inspect } = require("util");

function fullLog(data) {
    console.log(inspect(data, { maxArrayLength: null, maxStringLength: null }));
}

const boardData = new BoardData(null, null, process.argv[2], process.argv[3]);

boardData.answer.allSort(true);

console.log(boardData.answer.makeSendData(true, false)?.n);

/* コマンドライン引数のシグネチャ
 * node --max-old-space-size={RAM_SIZE[MB]} sub.js width height
 * width: process.argv[2]
 * height: process.argv[3]
 */