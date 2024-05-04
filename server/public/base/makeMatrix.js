const { transpose, setFormatCuttingDie, dieTypes } = require("./formatCuttingDie");

/**
 * 問題の完成形のボードをランダムに作成する関数
 * @param {number} height 配列の縦の要素数
 * @param {number} width 配列の横の要素数
 * @returns 完成したボード（配列）
 */
function makeQuestionBoard(height, width) {
    /**
     * 問題の完成形の配列
     * @type {number[]}
     */
    let regularArray = [];
    /**
     * 配列の要素数
     */
    let elementCount = height * width;
    /**
     * for文内で配列に要素が入った回数
     */
    let elementCStart = 0;
    /**
     * 問題の完成形の1次元配列
     */
    let elementArray = [];

    /**
    * ボードをランダムに並び替える
    * @param {number[][]} array 並び替えるボード（2次元配列）
    */
    const shuffleBoard = array => {
        /** 与えられた引数の縦の要素数 */
        const height = array.length;

        /** 与えられた引数の横の要素数 */
        const width = array[0].length;

        for (let i = height - 1; -1 < i; i--) {
            for (let j = width - 1; -1 < j; j--) {
                /** ランダムに抽選された縦列の数値 */
                let randomHeight = Math.floor(Math.random() * (i + 1));

                /** ランダムに抽選された横列の数値 */
                let randomWidth = Math.floor(Math.random() * (j + 1));

                /** スワップする数値を一時的に保存する変数 */
                let temporaryElement = array[i][j];

                array[i][j] = array[randomHeight][randomWidth];
                array[randomHeight][randomWidth] = temporaryElement;
            }
        }
        return array;
    }

    // それぞれの要素数は全体の要素数の10%以上あるという法則の最低保証をつくるfor文
    for (let i = 0; i <= 3; i++) {
        for (let j = 0; j < elementCount / 10; j++) {
            elementArray.push(i);
            elementCStart++;
        }
    }

    // 最低保証を作った後の配列を乱数で埋める
    while (elementCStart < elementCount) {
        elementArray.push(Math.floor(Math.random() * 4));
        elementCStart++;
    }

    // 完成した配列をランダムに並び替える
    while (elementCount) {
        var j = Math.floor(Math.random() * elementCount);
        var t = elementArray[--elementCount];
        elementArray[elementCount] = elementArray[j];
        elementArray[j] = t;
    }

    //今まで取り扱ってた配列は1次元なので2次元に変換する
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

    return regularArray;
}

/**
 * 2次元配列を分割した2次元配列を4次元配列として記憶する配列
 * @param {number[][]} array 分割する2次元配列
 * @param {number} size 1辺をどれくらいの大きさで分割するか
 */
function partitionMatrix(array, size) {
    /**
    * 与えられた引数の縦の要素数
    */
    const height = array.length;
    /**
    * 与えられた引数の横の要素数
    */
    const width = array[0].length;

    /**
    * 外側の配列の縦列
    * @type {number[][][][]}
    */
    let regularLargeArray = [];
    for (let I = 0; I < Math.ceil(height / size); I++) {
        /**
        * 外側の配列の横列
        */
        let temporaryLargeArray = [];
        for (let J = 0; J < Math.ceil(width / size); J++) {
            /**
            * 内側の配列の縦列
            */
            let regularSmallArray = [];
            for (let i = I * size; i < I * size + size; i++) {
                /**
                * 内側の配列の横列
                */
                let temporarySmallArray = [];
                for (let j = J * size; j < J * size + size; j++) {
                    if (i < height && j < width) {
                        temporarySmallArray.push(array[i][j]);
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
 * 
 * @param {number[]} array 
 * @param {number[][]} dieArray 
 * @param {number[]} position 
 * @param {number} direction 
 * @returns 
 */
function cutBoard(array, dieArray, position, direction) {

    if (direction == 1 || direction == 3) {
        array = transpose(array);
        dieArray = transpose(dieArray);
        let swap = position[1];
        position[0] = position[1];
        position[1] = swap;
    }

    /**
    * 与えられた配列の縦の要素数
    */
    const height = array.length;
    /**
    * 与えられた配列の横の要素数
    */
    const width = array[0].length;
    /**
    * 与えられた抜き型の縦の要素数
    */
    const dieHeight = dieArray.length;
    /**
    * 与えられた抜き型の横の要素数
    */
    const dieWidth = dieArray[0].length;

    for (let i = position[1]; i < position[1] + dieHeight; i++) {
        let pullOut = []
        let pullOutCount = 0;
        let temporaryArray = [];
        for (let j = 0; j < width; j++) {
            console.log(`${i}, ${j}`);
            console.log(dieArray[i][j]);
            if (position[0] <= i && i <= position[0] + dieWidth && dieArray[i][j] == 1) {
                pullOut.push(array[i][j]);
                pulloutCout++;
            }
            else {
                temporaryArray.push(array[i][j]);
            }
        }

        console.log(temporaryArray);
        console.log(pullOutCount);

        if (pullOutCount != 0) {
            for (let j = 0; j < pullOutCount; j++) {
                if (direction == 1 || direction == 4) {
                    temporaryArray.unshift(pullOut[j]);
                }
                if (direction == 2 || direction == 3) {
                    temporaryArray.push(pullOut[j]);
                }
            }
        }
        for (let j = 0; j < width; j++) {
            array[i][j] = temporaryArray[i][j];
        }
    }

    if (direction == 1 || direction == 3) {
        return transpose(array);
    }

    return array;
}

let testArray = makeQuestionBoard(6, 6);
console.log(testArray);
let { die } = setFormatCuttingDie(2, dieTypes.type1);
let pos = [1, 2];
testArray = cutBoard(testArray, die, pos, 4);
console.log(testArray);