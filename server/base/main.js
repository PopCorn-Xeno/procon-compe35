const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { pullOutOld } = require("./functions/legacy");
const { BoardData, Board } = require("./functions/class");

const patternData = new BoardData(null, 256, 256);
console.log(patternData.board.start.array);
console.log(patternData.patterns[23]);

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

pullOut(patternData.board.start,patternData.patterns[23],[0,0],1);
//console.log(patternData.board.start.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");