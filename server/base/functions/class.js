const { makeQuestionBoard, partitionBoard, pullOut } = require("./boardUtility");
const cloneDeep = require("lodash/cloneDeep");

class BoardData {

    /** ボードの情報 */
    #board = {
        /**
         * ボードの初期状態
         * @type {Board}
         */
        start: Board,
        /**
         * ボードの最終状態
         * @type {Board}
         */
        goal: Board
    };

    /**
     * この問題で使える一般抜き型の情報
     * @type {Board[]}
     */
    #patterns = [];

    /** ボードの情報 */
    get board() {
        return this.#board;
    }

    /** 一般抜き型の情報 */
    get patterns() {
        return this.#patterns;
    }

    /**
     * 
     * @param {*} data 
     * @param {*} width 
     * @param {*} height 
     */
    constructor(data = null, width = 0, height = 0) {
        // 受信データを使用しなかった場合、問題をランダムで作るモードに移行する
        if (data === null) {
            this.#makeRandom(height, width);
        }
        // 受信データを使用する場合、JSONからデータを取得する
        else {
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

        for (let i = 0; i < 25; i++) {
            this.#patterns.push(this.#setFormatPattern(i));
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

            /** 引数の対象配列をディープコピーしたシャッフル用の配列 */
            let clone = cloneDeep(array);

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
        this.#board.start = new Board(shuffleBoard(regularArray));
        this.#board.goal = new Board(shuffleBoard(this.#board.start.array));

        return this;
    }

    #setFormatPattern(patternNumber) {

        if (patternNumber == 0) {
            const array = 1;
            return new Board(array);
        }

        /**
        * 抜き型の大きさ
        * @param {number} length
        */
        const length = Math.pow(2, Math.floor((patternNumber + 2) / 3));
        /**
        * 抜き型のタイプ
        * @param {number} type
        */
        const type = (patternNumber - 1) % 3 + 1;

        let i = 0;

        switch (type) {
            case 1:
                return new Board(new Array(length).fill(new Array(length).fill(1)));
            case 2:
                i = 0;
                return new Board(new Array(length).fill(0).map(() => i++ % 2 == 0 ? new Array(length).fill(1) : new Array(length).fill(0)));
            case 3:
                i = 0;
                return new Board(new Array(length).fill(new Array(length).fill(0).map(() => i++ % 2 == 0 ? 1 : 0)));
        }
    }
}

class Board {
    /**
     *Boardクラスの中の配列
     */
    array = [[]];
    /**
     *Boardクラスの中の配列の高さ
     */
    get height() {
        if (this.array == 1) {
            return 1;
        }
        return this.array.length;
    }
    /**
     *Boardクラスの中の配列の幅
     */
    get width() {
        if (this.array[0] == null) {
            return 0;
        }
        if (this.array == 1) {
            return 1;
        }
        return this.array[0].length;
    }

    /**
     * 
     * @param {number[][]} array 
     */
    constructor(array) {
        this.array = array;
    }

    transpose() {
        this.array = this.array[0].map((col, i) => this.array.map(row => row[i]));
    }
}

class Order {
    constructor(pattern, position, direction, array) {
        this.pattern = pattern;
        this.position = position;
        this.direction = direction;
        this.array = array;
    }
}

module.exports.BoardData = BoardData;
module.exports.Order = Order;
module.exports.Board = Board;