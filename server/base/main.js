/*
cd ./server/base
node main.js
*/
const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { pullOutOld } = require("./functions/legacy");
const { BoardData, Board, Answer } = require("./functions/class");

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

const boardData = new BoardData(null, 6, 6);

const answer = new Answer(boardData.board.start);
console.log(answer.order[0].board.array);
answer.add(boardData.patterns[5], [1, 1], 1);
console.log(answer.order[1].board.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");