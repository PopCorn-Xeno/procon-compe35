const { makeQuestionBoard, partitionBoard, } = require("./boardUtility");
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

class Answer {
    /**
    * 操作手順
    * @type {Order[]}
    */
    order = [];

    constructor(array) {
        this.order[0] = new Order(array, null, null, null);
        this.turn = 0;
    }

    add(pattern, position, direction) {
        this.order.push(new Order(this.#pullOut(this.order[this.turn].board, pattern, position, direction), pattern, position, direction));
        this.turn++;
    }

    swap(position,size=1){
        order=new Order(this.order[this.turn].board,);
    }

    /**
     * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
     * @param {Board} board　並べ替えたい2次元配列 
     * @param {Board} pattern　抜き型の配列
     * @param {number[]} position　座標(x,y)
     * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
     * @returns 
     */
    #pullOut(board, pattern, position, direction) {

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
            return null;
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

        let array = new Array(board.height).fill(0).map((_, i) => i++).map(i => pull(i));

        if (errorFlag == true) {
            console.error("pullOut関数:使用した抜き型の要素に1がなかったため有効な操作になりませんでした");
            return null;
        }

        let returnBoard = new Board(array);

        if (direction % 2 == 1) {
            returnBoard.transpose();
        }

        return returnBoard;
    }

}

class Order {
    constructor(board, pattern, position, direction) {
        /**
         * 操作手順の内容をボードに記す
         * @type {Board}
         */
        this.board = board;
        this.pattern = pattern;
        this.position = position;
        this.direction = direction;
    }
}

module.exports.BoardData = BoardData;
module.exports.Order = Order;
module.exports.Board = Board;
module.exports.Answer = Answer;