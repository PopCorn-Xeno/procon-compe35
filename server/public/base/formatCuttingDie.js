/**
 * 定型抜き型を作成する関数
 * length=配列の長さ
 * type=定型抜き型のタイプ
 * 1=全て1
 * 2=偶数行が1
 * 3=偶数列が1
 */
function setFormatCuttingDie(length, type) {
    /**
    * 定型抜き型の完成形の配列
    */
    const formatArray = [];

    for (let i = 0; i < length; i++) {
        /**
        * pushする1次元配列を一時的に保存する配列
        */
        let temporaryArray = [];
        //2次元配列を作る2重forループ
        for (let j = 0; j < length; j++) {
            //タイプ毎の場合分け
            if (type == 1) {//タイプ1の場合
                temporaryArray.push(1);
            }
            else if (type > 1) {//タイプ2,3の場合
                if (i % 2 == 0) {
                    temporaryArray.push(1);
                }
                else {
                    temporaryArray.push(0);
                }
            }
        }
        formatArray.push(temporaryArray);
    }

    //タイプ3はタイプ2の転置行列とする
    if (type == 3) {
        return transpose(formatArray, length);
    }

    return formatArray;
}


/**
* 配列の転置する関数
*/
function transpose(array) {

    /**
    * 与えられた引数の縦の要素数
    */
    const height = array.length;
    /**
    * 与えられた引数の横の要素数
    */
    const width = array[0].length;
    /**
    * 転置後の配列
    */
    let transposedArray = [];

    for (let i = 0; i < height; i++) {
        /**
        * pushする1次元配列を一時的に保存する配列
        */
        let temporaryArray = [];
        for (let j = 0; j < width; j++) {
            temporaryArray.push(array[j][i]);
        }
        transposedArray.push(temporaryArray);
    }

    return transposedArray;
}

let testArray = setFormatCuttingDie(4, 3);
console.log(testArray);