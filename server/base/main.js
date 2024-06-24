/*
cd ./server/base
node main.js
*/
const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { pullOutOld } = require("./functions/legacy");
const { BoardData, Board, History } = require("./functions/class");

const boardData = new BoardData(null, 6, 6);

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

const history = new History(boardData.board.start, null, null, null);
console.log(history.order[0].board.array);
history.add(boardData.patterns[5], [1, 1], 1);
console.log(history.order[1].board.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");