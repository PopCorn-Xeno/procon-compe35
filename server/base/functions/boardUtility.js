const { Order, BoardData, Board } = require("./class");
const cloneDeep = require("lodash/cloneDeep");

/**
 * 2次元配列を分割した2次元配列を4次元配列として記憶する配列
 * @param {Board} board 分割する2次元配列
 * @param {number} size 1辺をどれくらいの大きさで分割するか
 */
function partitionBoard(board, size) {
    /**
    * 外側の配列の縦列
    * @type {number[][][][]}
    */
    let regularLargeArray = [];
    for (let I = 0; I < Math.ceil(board.height / size); I++) {
        /**外側の配列の横列*/
        let temporaryLargeArray = [];
        for (let J = 0; J < Math.ceil(board.width / size); J++) {
            /** 内側の配列の縦列*/
            let regularSmallArray = [];
            for (let i = I * size; i < I * size + size; i++) {
                /**内側の配列の横列*/
                let temporarySmallArray = [];
                for (let j = J * size; j < J * size + size; j++) {
                    if (i < height && j < width) {
                        temporarySmallArray.push(board.array[i][j]);
                    }
                    else {
                        temporarySmallArray.push(4);
                    }
                }
                regularSmallArray.push(temporarySmallArray);
            }
            temporaryLargeArray.push(regularSmallArray);
        }
        regularLargeArray.push(temporaryLargeArray);
    }

    return regularLargeArray;
}

function evaluate(questionBoard, currentBoard) {

    if (questionBoard.length != currentBoard.length || questionBoard[0].length != currentBoard[0].length) {
        return console.error("evalute関数:比較する配列の大きさが違います");
    }

    /**与えられたボードの縦の要素数*/
    const height = questionBoard.length;
    /**与えられたボードの横の要素数*/
    const width = questionBoard[0].length;

    let array = [];

    for (let i = 0; i < height; i++) {
        temporaryArray = [];
        for (let j = 0; j < width; j++) {
            if (questionBoard[i][j] == currentBoard[i][j]) {
                temporaryArray.push(0);
            }
            else {
                temporaryArray.push(1);
            }
        }
        array.push(temporaryArray);
    }

    return array;
}

module.exports.partitionBoard = partitionBoard;
module.exports.evaluate = evaluate;