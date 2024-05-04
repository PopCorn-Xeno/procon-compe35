const { transpose } = require("./boardUtility");

/**
 * 定型抜き型を作成する関数
 * @param {number} length 配列の大きさ
 * @param {number} type 定型抜き型のタイプ - typesオブジェクトを参照
 * @returns 定型抜き型とその通し番号を含む配列
 */
function setFormatPattern(length, type) {
    /**
    * 定型抜き型の完成形の配列
    * @type {number[][]}
    */
    const formatPattern = [];

    for (let i = 0; i < length; i++) {
        /**　pushする1次元配列を一時的に保存する配列　*/
        let temporaryArray = [];
        //　2次元配列を作る2重forループ
        for (let j = 0; j < length; j++) {
            // タイプ毎の場合分け
            // タイプ1の場合
            if (type === types.type1) {
                temporaryArray.push(1);
            }
            // タイプ2, 3の場合
            else if (type > types.type1) {
                if (i % 2 == 0) {
                    temporaryArray.push(1);
                }
                else {
                    temporaryArray.push(0);
                }
            }
        }
        formatPattern.push(temporaryArray);
    }

    // タイプ3はタイプ2の転置行列とする
    if (type === types.type3) {
        transpose(formatPattern, length);
    }

    /**
     * 定型抜き型の通し番号を求める
     * @param {number} length 配列の長さ
     * @param {number} type 定型抜き型のタイプ
     * @returns 定型抜き型の通し番号
     */
    const dieIndex = (length, type) =>
        // 長さが2以上256以下でタイプ番号が正常の時のみ計算する
        // 長さ1のときは通し番号0
        (length >= 2 && length <= 256) && (type >= types.type1 && type <= types.type3) ?
            1 + 3 * (Math.log2(length) - 1) + type - 1 : 0;

    return { die: formatPattern, index: dieIndex(length, type) };
}

/** 抜き型のタイプ */
const types = Object.freeze({
    /** 全てのセルが1 */
    type1: 1,
    /** 偶数行のセルが1で、奇数行のセルが0 */
    type2: 2,
    /** 偶数行のセルが0で、奇数行のセルが1 */
    type3: 3
})

module.exports.setFormatPattern = setFormatPattern;
module.exports.patternTypes = types;