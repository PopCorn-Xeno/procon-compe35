const { Order, BoardData, Board } = require("./class");

/**
 * 問題の完成形のボードをランダムに作成する関数
 * @param {number} height 配列の縦の要素数
 * @param {number} width 配列の横の要素数
 * @returns 完成したボード(Boardクラス)
 */
function makeQuestionBoard(height, width) {
    /**
     * 問題の完成形の配列
     * @type {number[]}
     */
    let regularArray = [];

    /** 配列の要素数*/
    let elementCount = height * width;

    /**　for文内で配列に要素が入った回数　*/
    let elementCountStart = 0;

    /** 問題の完成形の1次元配列*/
    let elementArray = [];

    /**
    * ボードをランダムに並び替える
    * @param {number[][]} array 並び替えるボード（2次元配列）
    */
    const shuffleBoard = array => {

        // 遅いかもしれん
        /** 引数の対象配列をディープコピーしたシャッフル用の配列 */
        let clone = JSON.parse(JSON.stringify(array));

        /** 与えられた引数の縦の要素数 */
        const height = clone.length;

        /** 与えられた引数の横の要素数 */
        const width = clone[0].length;

        for (let i = height - 1; -1 < i; i--) {
            for (let j = width - 1; -1 < j; j--) {
                /** ランダムに抽選された縦列の数値 */
                let randomHeight = Math.floor(Math.random() * (i + 1));

                /** ランダムに抽選された横列の数値 */
                let randomWidth = Math.floor(Math.random() * (j + 1));

                /** スワップする数値を一時的に保存する変数 */
                let temporaryElement = clone[i][j];

                clone[i][j] = clone[randomHeight][randomWidth];
                clone[randomHeight][randomWidth] = temporaryElement;
            }
        }
        return clone;
    }

    // それぞれの要素数は全体の要素数の10%以上あるという法則の最低保証をつくるfor文
    for (let i = 0; i <= 3; i++) {
        for (let j = 0; j < elementCount / 10; j++) {
            elementArray.push(i);
            elementCountStart++;
        }
    }

    // 最低保証を作った後の配列を乱数で埋める
    while (elementCountStart < elementCount) {
        elementArray.push(Math.floor(Math.random() * 4));
        elementCountStart++;
    }

    // 完成した配列をランダムに並び替える
    while (elementCount) {
        var j = Math.floor(Math.random() * elementCount);
        var t = elementArray[--elementCount];
        elementArray[elementCount] = elementArray[j];
        elementArray[j] = t;
    }

    //　今まで取り扱ってた配列は1次元なので2次元に変換する
    for (let i = 0; i < height; i++) {
        /** pushする1次元配列を一時的に保存する配列 */
        let temporaryArray = [];

        for (let j = 0; j < width; j++) {
            temporaryArray.push(elementArray[0]);
            elementArray.shift();
        }
        regularArray.push(temporaryArray);
    }

    // 2次元配列をランダムに並び替える
    regularArray = shuffleBoard(regularArray);

    return new Board(regularArray);
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

/**
* 配列を転置する関数
* @param {Board} board
*/
function transpose(board) {
    /**
    * 転置後の配列
    * @type {number[][]}
    */
    let transposedArray = [];

    for (let i = 0; i < board.width; i++) {
        /**　pushする1次元配列を一時的に保存する配列　*/
        let temporaryArray = [];
        for (let j = 0; j < board.height; j++) {
            temporaryArray.push(board.array[j][i]);
        }
        transposedArray.push(temporaryArray);
    }

    board.array=transposedArray;
}

/**
 * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
 * @param {Board} board　並べ替えたい2次元配列 
 * @param {Board} pattern　抜き型の配列
 * @param {number[]} position　座標(x,y)
 * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
 * @returns 
 */
function pullOut(board, pattern, position, direction) {

    //縦方向の操作は配列と抜き型を転置し座標を交換して操作する
    if (direction == 1 || direction == 3) {
        transpose(board);
        transpose(pattern);
        let swap = position[1];
        position[1] = position[0];
        position[0] = swap;
    }

    /**与えられた配列の縦の要素数*/
    const height = board.length;
    /**与えられた配列の横の要素数*/
    const width = board[0].length;
    /**与えられた抜き型の縦の要素数*/
    const dieHeight = pattern.length;
    /**与えられた抜き型の横の要素数*/
    const dieWidth = pattern[0].length;

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
                if (pattern[i - position[1]][j - position[0]] == 1) {
                    if (direction == 1 || direction == 4) {
                        pulldOutArray.push(board.array[i][j]);
                    }
                    if (direction == 2 || direction == 3) {
                        pulldOutArray.unshift(board.array[i][j]);
                    }
                }
            }
            else {
                temporaryArray.push(board[i][j]);
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
        return transpose(board);
    }
}

function swap(board, position1, position2, size = 1) {

    /** 与えられた配列の縦の要素数 */
    let height = board.height;
    /** 与えられた配列の横の要素数 */
    let width = array[0].length;
    /** 値を交換する用の変数 */
    let swap;

    // エラー処理
    let errorFlag = false;
    if (position1[0] != position2[0] && position1[1] != position2[1]) {
        console.error("swap関数:要素同士が直線上に並んでいません");
        errorFlag = true;
    }

    if (width < position1[0]) {
        console.error("swap関数:position1のx座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    else if (width < position2[0]) {
        console.error("swap関数:position2のx座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }

    if (height < position1[1]) {
        console.error("swap関数:position1のy座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    else if (height < position2[1]) {
        console.error("swap関数:position2のy座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    if (errorFlag == true) {
        return board;
    }

    if (position1[0] == position2[0]) {
        array = transpose(array);
        swap = position1[0];
        position1[0] = position1[1];
        position1[1] = swap;
        swap = position2[0];
        position2[0] = position2[1];
        position2[1] = swap;
        swap = height;
        height = width;
        width = swap;
    }

    if (position2[0] < position1[0]) {
        swap = position1[0];
        position1[0] = position2[0];
        position2[0] = swap;
    }

    const leftLength = position1[0] - 1;
    const centerLength = width - position1[0] - position2[0];
    const rightLength = width - position2[0];



    return;
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

module.exports.makeQuestionBoard = makeQuestionBoard;
module.exports.partitionBoard = partitionBoard;
module.exports.transpose = transpose;
module.exports.pullOut = pullOut;
module.exports.evaluate = evaluate;
module.exports.swap = swap