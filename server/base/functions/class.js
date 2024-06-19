const { setFormatPattern, patternTypes } = require("./formatPattern");
const { makeQuestionBoard, partitionBoard, transpose, pullOut } = require("./boardUtility");

class BoardData {

    /** ボードの情報 */
    #board = {
        /**
         * ボードの横幅
         * @type {number}
         */
        width: 0,
        /**
         * ボードの縦幅
         * @type {number}
         */
        height: 0,
        /**
         * ボードの初期状態
         * @type {number[][]}
         */
        start: [[]],
        /**
         * ボードの最終状態
         * @type {number[][]}
         */
        goal: [[]]
    };

    /** この問題で使える一般抜き型の情報 */
    #patterns = [{
        /**
         * 抜き型の通し番号
         * @type {number}
         */
        p: 0,
        /**
         * 抜き型の横幅
         * @type {number}
         */
        width: 0,
        /**
         * 抜き型の高さ
         * @type {number}
         */
        height: 0,
        /**
         * 抜き型の配置
         * @type {number[][]}
         */
        cells: [[]]
    }];

    /**
     * 現在作業中のボード
     * @type {[number[][]]}
     */
    current;

    /** ボードの情報 */
    get board() {
        return this.#board;
    }

    /** 一般抜き型の情報 */
    get patterns() {
        return this.#patterns;
    }

    constructor(height, width, data = null) {
        // 受信データを使用しなかった場合、問題をランダムで作るモードに移行する
        if (data === null && (height || width)) {
            this.#makeRandom(height, width);
            return this;
        }

        // 受信データを使用する場合、JSONからデータを取得する
        /**
         * 受信データのボード情報をコピー
         * @type {{}}
         */
        let board = data?.board;
        /**
         * 受信データの抜き型情報をコピー
         * @type {{}[]}
         */
        let patterns = data?.general?.patterns;

        this.#board.width = board?.width;
        this.#board.height = board?.height;
        // 最後は符号の演算子を利用して暗黙的に数値型に変換する
        // for文の方が早く回るが、処理時間が気になり始めたときに改善する
        this.#board.start = board?.start.map(str => str.split("").map(elem => +elem));
        this.#board.goal = board?.goal.map(str => str.split("").map(elem => +elem));

        this.#patterns = patterns;
        for (let i = 0; i < this.#patterns.length; i++) {
            this.#patterns[i].cells = this.#patterns[i].cells.map(str => str.split("").map(elem => +elem));
        }
    }

    /**
     * 問題のボードと完成形のボードをランダムに作成する関数
     * @param {number} height 配列の縦の要素数
     * @param {number} width 配列の横の要素数
     * @returns クラスインスタンス (this)
     */
    #makeRandom(height, width) {
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
        this.#board.start = shuffleBoard(regularArray);
        this.#board.goal = shuffleBoard(this.#board.start);
        this.#board.height = regularArray.length;
        this.#board.width = regularArray[0].length;
        return this;
    }
}

class Order {
    constructor(pattern, position, direction) {
        this.pattern = pattern;
        this.position = position;
        this.direction = direction;
    }
}

module.exports.BoardData = BoardData;
module.exports.Order=Order;