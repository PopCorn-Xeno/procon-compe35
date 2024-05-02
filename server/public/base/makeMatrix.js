/**
 * 問題の完成形の配列をランダムに作成する関数
 * @param height 配列の縦の要素数
 * @param width 配列の横の要素数
 */

const { transpose, setFormatCuttingDie } = require("./formatCuttingDie");

function MakeMatrixQuestion(height, width) {
    /**
     * 問題の完成形の配列
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

    //完成した配列をランダムに並び替える
    while (elementCount) {
        var j = Math.floor(Math.random() * elementCount);
        var t = elementArray[--elementCount];
        elementArray[elementCount] = elementArray[j];
        elementArray[j] = t;
    }

    //今まで取り扱ってた配列は1次元なので2次元に変換する
    for (let i = 0; i < height; i++) {
        /**
         * pushする1次元配列を一時的に保存する配列
         */
        let temporaryArray = [];
        for (let j = 0; j < width; j++) {
            temporaryArray.push(elementArray[0]);
            elementArray.shift();
        }
        regularArray.push(temporaryArray);
    }

    // 2次元配列をランダムに並び替える
    regularArray = MatrixShuffle(regularArray);

    return regularArray;
}

/**
 * 2次元配列をランダムに並び替える
 * @param array 並び替える2次元配列
 */
function MatrixShuffle(array) {
    /**
    * 与えられた引数の縦の要素数
    */
    const height = array.length;
    /**
    * 与えられた引数の横の要素数
    */
    const width = array[0].length;

    for (let i = height - 1; -1 < i; i--) {
        for (let j = width - 1; -1 < j; j--) {
            /**
            * ランダムに抽選された縦列の数値
            */
            let randomHeight = Math.floor(Math.random() * (i + 1));
            /**
            * ランダムに抽選された横列の数値
            */
            let randomWidth = Math.floor(Math.random() * (j + 1));
            /**
            * スワップする数値を一時的に保存する変数
            */
            let temporaryElement = array[i][j];
            array[i][j] = array[randomHeight][randomWidth];
            array[randomHeight][randomWidth] = temporaryElement;
        }
    }

    return array;
}

/**
 * 2次元配列を分割した2次元配列を4次元配列として記憶する配列
 * @param {number[][]} array 分割する2次元配列
 * @param {number} size 1辺をどれくらいの大きさで分割するか
 */
function PartitionMatrix(array, size) {
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
                        temporarySmallArray.push(null);
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

function CuttingDie(array, dieArray, coordinate, direction) {

    if (direction == 1 || direction == 3) {
        array = transpose(array);
        dieArray = transpose(dieArray);
        let swap = coordinate[1];
        coordinate[0] = coordinate[1];
        coordinate[1] = swap;
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

    for (let i = coordinate[1]; i < coordinate[1] + dieHeight; i++) {
        let pullOut = []
        let pullOutCount = 0;
        let temporaryArray = [];
        for (let j = 0; j < width; j++) {
            console.log(i+","+j);
            console.log(dieArray[i][j]);
            if (coordinate[0] <= i && i <= coordinate[0] + dieWidth && dieArray[i][j] == 1) {
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

let testArray = MakeMatrixQuestion(6, 6);
console.log(testArray);
let die = setFormatCuttingDie(2, 1);
let coor = [1, 2];
testArray = CuttingDie(testArray, die[0], coor, 4);
console.log(testArray);