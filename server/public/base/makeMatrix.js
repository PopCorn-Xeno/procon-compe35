/**
 * 問題の完成形の配列をランダムに作成する関数
 * height=配列の縦の要素数
 * width＝配列の横の要素数
 */
function MakeMatrixElement(height, width) {
    /**
     * 問題の完成形の配列
     */
    const targetArray = [];
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

    //それぞれの要素数は全体の要素数の10%以上あるという法則の最低保証をつくるfor文
    for (let i = 0; i <= 3; i++) {
        for (let j = 0; j < elementCount / 10; j++) {
            elementArray.push(i);
            elementCStart++;
        }
    }

    //最低保証を作った後の配列を乱数で埋める
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
        targetArray.push(temporaryArray);
    }

    return targetArray;
}

let testArray = MakeMatrixElement(5, 5);
console.log(testArray);