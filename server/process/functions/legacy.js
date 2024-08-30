const { Order, BoardData, Board } = require("./class");
const cloneDeep = require("lodash/cloneDeep");

/**
 * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
 * @param {Board} board　並べ替えたい2次元配列 
 * @param {Board} pattern　抜き型の配列
 * @param {number[]} position　座標(x,y)
 * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
 * @returns 
 */
function pullOutOld(board, pattern, position, direction) {

    //縦方向の操作は配列と抜き型を転置し座標を交換して操作する
    if (direction == 1 || direction == 3) {
        board.transpose();
        pattern.transpose();
        let swap = position[1];
        position[1] = position[0];
        position[0] = swap;
    }

    //引数arrayを操作するための縦列のfor文
    for (let i = position[1]; i < position[1] + pattern.height; i++) {

        /** 抜いた要素を記録する配列 */
        let pulldOutArray = [];

        /** 配列の横列(1行のみ) */
        let temporaryArray = [];

        // 横列のfor文その1
        for (let j = 0; j < board.width; j++) {
            // 抜き型の1の部分をpullOutに記録し、そうでない部分をtemporaryArrayに記録する
            if (position[0] <= j && j < position[0] + pattern.width) {
                if (pattern.array[i - position[1]][j - position[0]] == 1) {
                    if (direction == 1 || direction == 4) {
                        pulldOutArray.push(board.array[i][j]);
                    }
                    if (direction == 2 || direction == 3) {
                        pulldOutArray.unshift(board.array[i][j]);
                    }
                }
            }
            else {
                temporaryArray.push(board.array[i][j]);
            }
        }

        // 横列のfor文その2
        for (let j = 0; j < pulldOutArray.length; j++) {
            //pullOutの配列を右か左に寄せる
            if (direction == 1 || direction == 4) {
                temporaryArray.push(pulldOutArray[j]);
            }
            if (direction == 2 || direction == 3) {
                temporaryArray.unshift(pulldOutArray[j]);
            }
        }

        // 横列のfor文その3
        for (let j = 0; j < board.width; j++) {
            // 引数で与えられた配列に再代入される
            board.array[i][j] = temporaryArray[j];
        }
    }

    // 縦方向の操作はもう一度転置をして元に戻す
    if (direction == 1 || direction == 3) {
        return board.transpose();
    }
}

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

module.exports.pullOutOld = pullOutOld;
module.exports.partitionBoard = partitionBoard;