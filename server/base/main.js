/*
cd ./server/base
node main.js
*/
const { makeQuestionBoard, partitionBoard, pullOut, evaluate, swap } = require("./functions/boardUtility");
const { pullOutOld } = require("./functions/legacy");
const { BoardData, Board, Order } = require("./functions/class");

const boardData = new BoardData(null, 6, 6);
const order = new Order(boardData.board.start.array, boardData.patterns[5].array, [1, 1], 1);
console.log(order.array);
console.log(order.pattern);

console.log("測定を開始します");
const accuracy = 1000;
const start = performance.now();

pullOut(order.array, order.pattern, order.position, order.direction);
console.log(order.array);

const end = performance.now();
console.log("計算時間=" + (Math.round((end - start) * accuracy) / (1000 * accuracy)) + "秒");