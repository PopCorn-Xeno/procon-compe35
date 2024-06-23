const { Order, BoardData, Board } = require("./class");
const cloneDeep = require("lodash/cloneDeep");

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
 * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
 * @param {Board} board　並べ替えたい2次元配列 
 * @param {Board} pattern　抜き型の配列
 * @param {number[]} position　座標(x,y)
 * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
 * @returns 
 */
function pullOut(board, pattern, position, direction) {

    let errorFlag = false;
    if (position[0] < 0 && pattern.width <= -position[0] || board.width <= position[0]) {
        console.error("pullOut関数:x座標が不正な値です(抜き型がボードから完全にはみ出しています");
        errorFlag = true;
    }
    if (position[1] < 0 && pattern.height <= -position[1] || board.width <= position[1]) {
        console.error("pullOut関数:y座標が不正な値です(抜き型がボードから完全にはみ出しています");
        errorFlag = true
    }
    if (errorFlag == true) {
        return false;
    }

    let clonePattern = cloneDeep(pattern);

    if (direction % 2 == 1) {
        board.transpose();
        clonePattern.transpose();
        let swap = position[0];
        position[0] = position[1];
        position[1] = swap;
    }

    if (position[1] < 0) {
        clonePattern.array = clonePattern.array.slice(Math.abs(position[1]));
        position[1] = 0;
    }
    if (position[0] < 0) {
        clonePattern.array = clonePattern.array.map(array => array.slice(Math.abs(position[0])));
        position[0] = 0;
    }

    if (board.width - clonePattern.width - position[0] < 0) {
        clonePattern.array = clonePattern.array.slice(0, board.height - position[1]).map(array => array.slice(0, board.width - position[0]));
    }

    errorFlag = true;

    const pull = (i) => {
        let advancedPattern = [];

        if (position[1] <= i && i < position[1] + clonePattern.height) {

            advancedPattern = new Array(position[0]).fill(0).concat(clonePattern.array[i - position[1]].concat(new Array(board.width - clonePattern.width - position[0]).fill(0)));
            if (advancedPattern.filter((element) => element == 1).length != 0 && errorFlag == true) {
                errorFlag = false;
            }

            let j = 0;
            let pulledOutArray = advancedPattern.map(element => element = { 'key': element, 'value': board.array[i][j++] }).filter(element => element.key == 1).map(element => element.value);
            j = 0;
            let temporaryArray = advancedPattern.map(element => element = { 'key': element, 'value': board.array[i][j++] }).filter(element => element.key == 0).map(element => element.value);

            switch (direction) {
                case 1:
                case 4:
                    return temporaryArray.concat(pulledOutArray);
                case 2:
                case 3:
                    return pulledOutArray.concat(temporaryArray);
            }
        }
        else {
            return board.array[i];
        }
    }

    let array = [...Array(board.height)].map((_, i) => i++).map(i => pull(i));

    if (errorFlag == false) {
        board.array = array;
    }
    else {
        console.error("pullOut関数:使用した抜き型の要素に1がなかったため有効な操作になりませんでした");
    }

    if (direction % 2 == 1) {
        board.transpose();
    }
}

function swap(board, position1, position2, size = 1) {

    /** 値を交換する用の変数 */
    let swap;

    // エラー処理
    let errorFlag = false;
    if (position1[0] != position2[0] && position1[1] != position2[1]) {
        console.error("swap関数:要素同士が直線上に並んでいません");
        errorFlag = true;
    }

    if (board.width < position1[0]) {
        console.error("swap関数:position1のx座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    else if (board.width < position2[0]) {
        console.error("swap関数:position2のx座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }

    if (board.height < position1[1]) {
        console.error("swap関数:position1のy座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    else if (board.height < position2[1]) {
        console.error("swap関数:position2のy座標が不正な値です(配列の外側の要素を指定することはできません");
        errorFlag = true;
    }
    if (errorFlag == true) {
        return false;
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
module.exports.pullOut = pullOut;
module.exports.evaluate = evaluate;
module.exports.swap = swap