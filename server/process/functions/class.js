const fs = require('fs');
const error = require("./error");
const cloneDeep = require("lodash/cloneDeep")

/**
 * 問題を解くためのクラス
 */
class BoardData {
    /**
     * この問題の解答
     * @type {Answer}
     */
    answer;

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

    /**
     * インスタンス化された時間を記録し、出力ファイル名に利用する
     * @type {string}
     */
    #id;

    /** ボードの情報 */
    get board() {
        return this.#board;
    }

    /** 一般抜き型の情報 */
    get patterns() {
        return this.#patterns;
    }

    /**
     * @typedef ProblemBoard 受信データにおけるボード情報の形式
     * @property {number} width 横幅
     * @property {number} height 縦幅
     * @property {string[]} start ボードの初期状態
     * @property {string[]} goal ボードの完成状態
     * 
     * @typedef ProblemPattern 受信データにおける抜き型情報の形式
     * @property {number} p 抜き型の番号
     * @property {number} width 横幅
     * @property {number} height 縦幅
     * @property {string[]} cells 抜き型
     */

    /**
     * 1. `board`と`patterns`を入力・`width`と`height`省略:
     *  **受信データを用いて問題を解く**
     * 
     * 2. `width`と`height`を入力・`board`と`patterns`を`null`指定:
     *  **ランダムに問題を作成して解く**
     * @param {ProblemBoard | null | 0} board 受信データのボードJSON
     * @param {ProblemPattern[] | null} patterns 受信データの抜き型JSON
     * @param {number} width ボードの横幅
     * @param {number} height ボードの縦幅
     */
    constructor(board = null, patterns = null, width = 0, height = 0) {
        // 定型抜き型を用意する
        for (let i = 0; i < 25; i++) {
            this.#patterns.push(this.#setFormatPattern(i));
        }

        // 受信データを使用する場合、JSONからデータを取得する
        if (board && patterns && (!width && !height)) {
            // 最後は符号の演算子を利用して暗黙的に数値型に変換する
            this.#board.start = new Board(board.start.map(str => str.split("").map(elem => +elem)));
            this.#board.goal = new Board(board.goal.map(str => str.split("").map(elem => +elem)));
            // 抜き型の番号が25より大きいものが送られてきたとしても関係なく前から詰めていく
            // 本来の番号を維持しないと回答で間違える可能性がある
            this.#patterns = this.#patterns.concat(patterns.map(pattern => new Board(pattern.cells.map(str => str.split("").map(elem => +elem)))))
            /* 要相談 */
            // 抜き型の番号が25より大きいものが送られてきたとしてもそのインデックスから詰めていく
            // 空のインデックスができてしまうので扱いづらいが本来の番号ごと維持できる
            // for (let i = 0; i < patterns.length; i++) {
            //     this.#patterns[patterns[i].p] = new Board(patterns[i].cells.map(str => str.split("").map(elem => +elem)));
            // }
        }

        // 受信データを使用しなかった場合、問題をランダムで作るモードに移行する、また0に指定すると座標を表す数値を出力する
        if (board === null) {
            this.#makeRandom(height, width);
        }
        else if (board == 0) {
            let sample = [];
            for (let i = 1; i <= height; i++) {
                let temporary = [];
                for (let j = 1; j <= width; j++) {
                    temporary.push(j * 10 + i);
                }
                sample.push(temporary);
            }

            this.#board.start = new Board(sample);
        }

        if (patterns == null) {
            for (let i = 0; i < 256; i++) {
                let array = new Array(Math.floor(Math.random() * 225) + 32).fill(0);
                let width = Math.floor(Math.random() * 225) + 32;
                for (let j = 0; j < array.length; j++) {
                    array[j] = new Array(width).fill(0).map(value => Math.round(Math.random()));
                }
                this.#patterns.push(new Board(array));
            }
        }

        this.answer = new Answer(this.#board.start, this.#board.goal, this.#patterns);
        // スラッシュやコロンなどファイル名禁止文字を取り除いて文字列化
        const date = new Date();
        this.#id = [
            date.getFullYear().toString(),
            (date.getMonth() + 1).toString().padStart(2, "0"),
            date.getDate().toString().padStart(2, "0"),
            date.getHours().toString().padStart(2, "0"),
            date.getMinutes().toString().padStart(2, "0"),
            date.getSeconds().toString().padStart(2, "0")
        ].join("-");
        // this.#id = `${new Date().toLocaleString().replace(/ /g, "-").replace(/[:/]/g, "-")}`;;
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
            /** 引数の対象配列をコピーしたシャッフル用の配列 */
            let clone = new Array(array.height);
            for (let i = 0; i < array.length; i++) {
                let temporaryArray = new Array(array.width);
                for (let j = 0; j < array[0].length; j++) {
                    temporaryArray[j] = array[i][j];
                }
                clone[i] = temporaryArray;
            }

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
    }

    /**
     * 定型抜き型を作る関数
     * @param {number} patternNumber 定型抜き型のn番目を表す
     * @returns {Board}
     */
    #setFormatPattern(patternNumber) {
        //0番目は配列ではないため個別に例外処理を行う
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

        //それぞれのタイプに対応した配列を返す
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

    /**
     * @typedef ReceptionData 受信データのJSON形式
     * @property {ProblemBoard} board ボードの情報
     * @property {ProblemGeneral} general 使用できる一般抜き型の情報
     * 
     * @typedef ProblemGeneral 使用できる一般抜き型の情報
     * @property {number} n 使用できる一般抜き型の個数
     * @property {ProblemPattern[]} patterns 一般抜き型
     */
    /**
     * 問題の受信データをファイルに出力する\
     * パラメータ`data`について
     * - 受信したJSON（オブジェクト）を指定する
     * - 指定しない或いはそれが`undefined`の場合はクラスが持っているボード情報をシリアライズする
     * @param {ReceptionData | undefined} data 受信データ
     * @param {boolean} isOverwritten ファイルを上書きして出力するか
     * @param {Problem | undefined} callback 結果を返却するコールバック
     */
    writeReceptionData(data, isOverwritten = false, callback) {
        /**
         * @callback Problem
         * @param {string} id 出力したJSONファイルの識別用日付情報など、結果ログと同じものである
         * @param {ReceptionData} data 問題JSON
         */

        if (!data) {
            data = {
                board: {
                    width: this.#board.start.width,
                    height: this.#board.start.height,
                    start: this.#board.start.formatCell(),
                    goal: this.#board.goal.formatCell()
                },
                general: {
                    n: this.#patterns.length - 25,
                    // 配布される一般抜き型の通し番号が毎回25から始まることを祈る
                    patterns: this.#patterns.slice(25).map((pattern, index) => new Object({
                        p: index + 25,
                        width: pattern.width,
                        height: pattern.height,
                        cells: pattern.formatCell()
                    }))
                }
            };
        }

        if (!fs.existsSync("./process/log/problem")) {
            fs.mkdirSync("./process/log/problem", { recursive: true });
        }

        if (!isOverwritten) {
            fs.writeFileSync(`./process/log/problem/problem_${this.#id}.json`, JSON.stringify(data, undefined, ' '), 'utf-8', (err) => console.error(err));
        }
        else {
            fs.writeFileSync("./process/log/problem/problem.json", JSON.stringify(data, undefined, " "), "utf-8", (err) => console.error(err));
        }
        
        callback?.call(this, isOverwritten ? "" : this.#id, data);
        return this;
    }

    /**
     * 回答用の送信データを作成し、ファイルに出力する
     * コールバックから元のデータも取得できる
     * @param {boolean} isOverwritten ファイルを上書きして出力するか
     * @param {Result | undefined} callback 結果を返却するコールバック
     */
    writeSendData(isOverwritten = false, callback) {
        /**
         * @callback Result
         * @param {string} id 出力したJSONファイルの識別用日付情報など、問題ログと同じものである
         * @param {{ n: number, ops: { p: number, x: number, y: number, s: number }[]}} data かかった手数と実際の操作手順を格納する送信データ
         */

        /**
         * 送信データの大枠
         * @type {{ n: number, ops: { p: number, x: number, y: number, s: number }[]}}
         */
        let sendData = {
            n: this.answer.order.length,
            ops: this.answer.order.map(order => new Object({
                p: order.patternNumber,
                x: order.position[0],
                y: order.position[1],
                s: order.direction == 1 ? 0 :       // 上
                   order.direction == 2 ? 3 :       // 右
                   order.direction == 3 ? 1 :       // 下
                   order.direction == 4 ? 2 : NaN   // 左 (仮にどれでもない場合はNaN)
                // 抜き型の操作方向をレギュレーションに合わせる
            }))
        }

        if (!fs.existsSync("./process/log/result")) {
            fs.mkdirSync("./process/log/result", { recursive: true });
        }

        const info = `${this.answer.time}_${this.answer.order.length}_${this.#board.start.width}x${this.#board.start.height}`;
        
        if (!isOverwritten) {
            fs.writeFileSync(`./process/log/result/result_${this.#id}_${info}.json`, JSON.stringify(sendData, undefined, ' '), 'utf-8', (err) => console.error(err));
        }
        else {
            fs.writeFileSync(`./process/log/result/result.json`, JSON.stringify(sendData, undefined, ' '), 'utf-8', (err) => console.error(err));
        }

        callback?.call(this, isOverwritten ? "" : this.#id, sendData);
        return this;
    }

    /**
     * スワップによるボード操作の履歴を記録するかどうか指定する
     * @param {boolean} flag 記録するか
     * @returns {BoardData} インスタンス
     */
    useSwapHistory(flag) {
        this.answer.swapHistory = flag ? [] : null;
        return this;
    }

    /**
     * スワップによるボード操作の記録を保存する
     * @param {boolean} isOverwritten 上書きするか（デフォルト: `false`）
     * @returns {BoardData} インスタンス
     */
    writeSwapHistory(isOverwritten = false) {
        if (this.answer.swapHistory) {
            if (!fs.existsSync("./process/log/swapHistory")) {
                fs.mkdirSync("./process/log/swapHistory", { recursive: true });
            }
            if (!isOverwritten) {
                fs.writeFileSync(`./process/log/swapHistory/swapHistory_${this.#id}.json`, JSON.stringify(this.answer.swapHistory, undefined, ' '), 'utf-8', (err) => console.error(err));
            }
            else {
                fs.writeFileSync(`./process/log/swapHistory/swapHistory.json`, JSON.stringify(this.answer.swapHistory, undefined, ' '), 'utf-8', (err) => console.error(err));
            }
        }
        return this;
    }
}

class Answer {
    /**
    * 操作手順
    * @type {Order[]}
    */
    order = [];

    /**
     * この問題で使える一般抜き型の情報
     * @type {Board[]}
     */
    patterns = [];

    /**
     * 現在のボード
     * @type {Board}
     */
    current;

    /**
     * 問題の完成形（解答のボード）
     * @type {Board}
     */
    goal;

    /**
     * 経過ターン数
     * @type {number}
     */
    turn;

    /**
     * 操作の終了フラグ
     * @type {boolean}
     */
    terminationFlag = false;

    /** 初期の一致数 */
    #initialMatchValue;

    /**
     * 1度の`swap()`によるセル交換の記録を記録する
     * - `orderRelation`: `start`にそのスワップが開始された`order`のインデックス、`end`にそのスワップが完了した`order`のインデックスを記録する
     * - `targetPosition`: `position1`と`position2`に交換対象の座標をそれぞれ記録する
     * - `targetSize`: `targetPosition`の位置から周囲を何マス含めてスワップしたか記録する
     * - `board`: `before`にスワップ実行前、`after`に実行後のボードを文字列にフォーマットして記録する
     * @type {{ orderRelation: { start: number, end: number }, targetPosition: { position1: [number, number], position2: [number, number] }, targetSize: number, board: { before: string[], after: string[] }}[] | null }
     */
    swapHistory;
    
    /**
     * エラーが発生したときのハンドリングを行うコールバック
     * @type {error.CatchHandler}
     */
    #errorHandler;

    /** 
     * `completeSort()` の実行時間を計測する\
     * 1msまでの精度に落として記録する
     */
    time = 0;

    /**
     * @param {Board} start 初期状態のボード
     * @param {Board} goal 解答のボード
     * @param {Board[]} patterns 使用する抜き型
     */
    constructor(start, goal, patterns) {
        this.current = cloneDeep(start);
        this.goal = goal;
        this.turn = 0;
        this.patterns = patterns;
        this.#initialMatchValue = this.countMatchValue();
    }

    /**
     * エラーが発生したときのアクションを設定する
     * @param {error.CatchHandler} callback エラーハンドラー
     * @returns インスタンス
     */
    setErrorHandler(callback) {
        this.#errorHandler = callback;
        return this;
    }

    /**
     * 2つのボードにおけるセルの一致数を数える
     * @param {number[][]} array1 デフォルトで現在操作中のボード (current.array)
     * @param {number[][]} array2 デフォルトで解答のボード (goal.array)
     * @returns 一致数
     */
    countMatchValue(array1 = this.current.array, array2 = this.goal.array) {
        let match = 0;
        if (!array1[0].length) {
            for (let i = 0; i < array1.length; i++) {
                if (array1[i] == array2[i]) {
                    match++;
                }
            }
        }
        else {
            for (let i = 0; i < array1.length; i++) {
                for (let j = 0; j < array1[0].length; j++) {
                    if (array1[i][j] == array2[i][j]) {
                        match++;
                    }
                }
            }
        }
        return match;
    }

    /**
     * 一致数から処理の進捗の割合を返す
     * @returns {number} 現在の一致数から初期の一致数を引いた分の進捗
     */
    progress() {
        const cellCount = this.current.width * this.current.height - this.#initialMatchValue;
        return (this.countMatchValue() - this.#initialMatchValue) / cellCount;
    }

    /**
     * `swap()`による操作の記録を追加する
     * @param {{ start: number, end: number }} orderRelation `start`にそのスワップが開始された`order`のインデックス、`end`にそのスワップが完了した`order`のインデックス
     * @param {{ position1: [number, number], position2: [number, number] }} targetPosition `position1`と`position2`にそれぞれ交換対象の座標
     * @param {number} targetSize `targetPosition`の位置から周囲を何マス含めてスワップしたか
     * @param {{ before: string[], after: string[] }} board `before`にスワップ実行前、`after`に実行後のフォーマット済みボード
     */
    #addHistory(orderRelation, targetPosition, targetSize, board) {
        // `BoardData.useHistory()`で使用しない設定になっていればpushされない
        this.swapHistory?.push({
            orderRelation: orderRelation,
            targetPosition: targetPosition,
            targetSize: targetSize,
            board: board
        })
    }

    /**
    * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
    * @param {Board} board　並べ替えたい2次元配列 
    * @param {number} patternNumber　抜き型の配列
    * @param {number[]} position　座標(x,y)
    * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
    * @returns 
    */
    #pullOut(board, patternNumber, position, direction) {
        //エラー処理
        /**エラーが起きたか判定する */
        //主にエラー内容が共存できる部分があるので必要である
        let errorFlag = false;
        //座標がx軸についてボードからはみ出しているかどうか判定する
        if ((position[0] < 0 && this.patterns[patternNumber].width <= -position[0]) || board.width <= position[0]) {
            error.throwError(new error.PullOutError("x座標が不正な値です(抜き型がボードから完全にはみ出しています)"), this.#errorHandler);
            errorFlag = true;
        }
        //座標がy軸についてボードからはみ出しているかどうか判定する
        if ((position[1] < 0 && this.patterns[patternNumber].height <= -position[1]) || board.height <= position[1]) {
            error.throwError(new error.PullOutError("y座標が不正な値です(抜き型がボードから完全にはみ出しています)"), this.#errorHandler);
            errorFlag = true
        }
        // エラーが起きた場合nullを返す
        if (errorFlag == true) {
            return null;
        }

        //errorFlag = true;

        // 縦の交換
        switch (direction) {
            case 1:
            case 3:
                //横にfor文を回す
                for (let i = 0 < position[0] ? position[0] : 0; i < Math.min(board.width, this.patterns[patternNumber].width + position[0]); i++) {
                    /** 縦列の情報 */
                    let line = new Array(board.height).fill(0);
                    // 縦にfor文を回す
                    for (let j = 0; j < board.height; j++) {
                        // 現在地の抜き型の値とその場所のボードの値をまとめる
                        if (patternNumber == 0) {
                            line[j] = { value: board.array[j][i], key: j - position[1] == 0 ? 1 : 0 };
                        }
                        else {
                            line[j] = { value: board.array[j][i], key: this.patterns[patternNumber].array[j - position[1]] ? this.patterns[patternNumber].array[j - position[1]][i - position[0]] ?? 0 : 0 };
                        }
                    }

                    // フィルターと結合によって変形後の形にする
                    if (direction == 1) {
                        line = line.filter(element => element.key == 0).concat(line.filter(element => element.key == 1));
                    }
                    else {
                        line = line.filter(element => element.key == 1).concat(line.filter(element => element.key == 0));
                    }
                    //完成した配列をボードの対応する縦列に代入する
                    for (let j = 0; j < board.height; j++) {
                        board.array[j][i] = line[j].value;
                    }
                }
                return board;
            // 横の交換
            case 2:
            case 4:
                // 縦にfor文を回す
                for (let i = 0 < position[1] ? position[1] : 0; i < Math.min(board.height, this.patterns[patternNumber].height + position[1]); i++) {
                    /** 横列の情報 */
                    let line = new Array(board.width).fill(0);
                    // 横にfor文を回す
                    for (let j = 0; j < board.width; j++) {
                        // 現在地の抜き型の値とその場所のボードの値をまとめる
                        if (patternNumber == 0) {
                            line[j] = { value: board.array[i][j], key: j - position[0] == 0 ? 1 : 0 };
                        }
                        else {
                            line[j] = { value: board.array[i][j], key: this.patterns[patternNumber].array[i - position[1]] ? this.patterns[patternNumber].array[i - position[1]][j - position[0]] ?? 0 : 0 };
                        }
                    }

                    // フィルターと結合によって変形後の形にする
                    if (direction == 4) {
                        line = line.filter(element => element.key == 0).concat(line.filter(element => element.key == 1)).map(element => element.value);
                    }
                    else {
                        line = line.filter(element => element.key == 1).concat(line.filter(element => element.key == 0)).map(element => element.value);
                    }
                    // 完成した配列をボードの対応する横列に代入する
                    board.array[i] = line;
                }
                return board;
        }
    }

    /** 
    * orderに操作内容をpushし追加で保存する関数
    * (右の条件で操作した後の配列,使用した抜き型の配列,座標,方向)
    * @param {number} patternNumber 抜き型の番号
    * @param {number[]} position 座標の値(x,y)
    * @param {number} direction 方向指定
    */
    #add(patternNumber, position, direction) {
        this.order.push(new Order(patternNumber, position, direction));
        this.#pullOut(this.current, patternNumber, position, direction);
        this.turn++;
    }

    /**
     * 一列に並んでいる2か所の要素を選択しその位置を入れ替える関数
     * @param {number[]} position1 1つ目の座標(x,y)
     * @param {number[]} position2 2つ目の座標(x,y)
     * @param {number} size 入れ替える配列の大きさ
     * @param {number} priorityCell 指定要素が重なっていたときどちらの要素の形を保つか(0=最短手,1=左側,2=右側)
     * @param {boolean} isRecursived 再帰呼び出しされているかどうか明示的に指定する
     */
    #swap(position1, position2, size = 1, priorityCell = 0, isRecursived = false) {
        // それぞれ`swapHistory`用に情報を格納するオブジェクト
        const orderRelation = { start: NaN, end: NaN };
        const targetPosition = { position1: [], position2: [] };
        const targetSize = size;
        const board = { before: null, after: null };

        if (!isRecursived) {
            // エラー処理
            /* エラーが起きたか判定する */
            // 主にエラー内容が共存できる部分があるので必要である
            let errorFlag = false;
            // それぞれのx座標がボードからはみ出していないか調べる
            if (position1[0] < 0 || this.current.width - size < position1[0]) {
                error.throwError(new error.SwapError("position1のx座標が不正な値です(配列の外側の要素を指定することはできません)"), this.#errorHandler);
                // "X position of the parameter `position1` is invalid (Cannot specify an element of outside of array)"
                errorFlag = true;
            }
            if (position2[0] < 0 || this.current.width - size < position2[0]) {
                error.throwError(new error.SwapError("position2のx座標が不正な値です(配列の外側の要素を指定することはできません)"), this.#errorHandler);
                // "X position of the parameter `position2` is invalid (Cannot specify an element of outside of array)"
                errorFlag = true;
            }
            // それぞれのy座標がボードからはみ出していないか調べる
            if (position1[1] < 0 || this.current.height - size < position1[1]) {
                error.throwError(new error.SwapError("position1のy座標が不正な値です(配列の外側の要素を指定することはできません)"), this.#errorHandler);
                // "Y position of the parameter `position1` is invalid (Cannot specify an element of outside of array)"
                errorFlag = true;
            }
            if (position2[1] < 0 || this.current.height - size < position2[1]) {
                error.throwError(new error.SwapError("position2のy座標が不正な値です(配列の外側の要素を指定することはできません)"), this.#errorHandler);
                // "2 position of the parameter `position2` is invalid (Cannot specify an element of outside of array)"
                errorFlag = true;
            }
            // サイズが不正な値でないか調べる
            if (size > 256) {
                error.throwError(new error.SwapError("sizeが不正な値です(256より大きいサイズを指定することはできません)"), this.#errorHandler);
                // "The parameter `size` is invalid (Cannot specify a size of more than 256)"
            }
            if (size == 0 ? false : !Number.isInteger(Math.log2(size))) {
                error.throwError(new error.SwapError("sizeが不正な値です(2^nの値を指定してください)"), this.#errorHandler);
                // "The parameter `size` is invalid (Specify the value of 2^n)"
            }

            // フラグを参照して関数を中断する
            if (errorFlag) {
                return null;
            }

            orderRelation.start = this.turn;
            targetPosition.position1 = cloneDeep(position1);
            targetPosition.position2 = cloneDeep(position2);
            board.before = this.current.formatCell();
        }

        // 指定した場所が直線上に並んでいるか調べる
        // 直線上に並んでいなかったら斜めの交換用に処理を変える
        if (position1[0] != position2[0] && position1[1] != position2[1]) {
            //指定した要素同士が重なっていないか調べる
            if ((Math.abs(position1[0] - position2[0]) < size) && (Math.abs(position1[1] - position2[1]) < size)) {
                error.throwError(new error.SwapError("直線的な交換でないのに指定した要素同士が重なっています"), this.#errorHandler);
                // "Each specified element is overlaping although nonlinear swap"
                return null;
            }

            /** 3つの座標が合わさった配列 */
            let position = [position1, position2, [position2[0], position1[1]]];

            const setPriority = (i) => {
                /** 操作する配列の左側 */
                let leftLength = position[i][i] < position[2][i] ? position[i][i] : position[2][i];
                /** 操作する配列の右側 */
                let rightLength = (i == 0 ? this.current.width : this.current.height) - (position[i][i] < position[2][i] ? position[2][i] : position[i][i]) - size;
                /** 操作する配列の真ん中 */
                let middleLength = (i == 0 ? this.current.width : this.current.height) - leftLength - rightLength - 2 * size;
                /** それぞれのlengthに値があるか判定するフラグ(左中右: 000) */
                let lengthFlag = (leftLength > 0 ? 1 : 0) * 100 + (middleLength > 0 ? 1 : 0) * 10 + (rightLength > 0 ? 1 : 0);
                // lengthFlagの値から優先度を設定する
                if (Math.abs(position[i][i] - position[2][i]) < size) {
                    return 0;
                }
                switch (lengthFlag) {
                    case 111:
                        return 5;
                    case 110:
                    case 11:
                        return 4;
                    case 101:
                        return 3;
                    case 10:
                        return 2;
                    case 100:
                    case 1:
                    case 0:
                        return 1;
                }
            }

            /** 要素の交換優先度 */
            let priority = [0, 1].map(i => setPriority(i));

            // 優先度の値によって交換の仕方を変える(関数の再帰を行っている)
            if (priority[0] < priority[1]) {
                this.#swap(position[0], position[2], size, size == 1 ? 0 : (position[0][0] < position[2][0] ? 1 : 2), true);
                this.#swap(position[1], position[2], size, 0, true);
                position2 = position[2];
                priorityCell = size == 1 ? 0 : (position[0][0] < position[2][0] ? 2 : 1);
            }
            else {
                this.#swap(position[1], position[2], size, size == 1 ? 0 : (position[1][1] < position[2][1] ? 1 : 2), true);
                this.#swap(position[0], position[2], size, 0, true);
                position1 = position[2];
                priorityCell = size == 1 ? 0 : (position[1][1] < position[2][1]) ? 2 : 1;
            }
        }

        /** 横列操作 = 0,縦列操作 = 1 */
        let type = 0;
        if (position1[0] == position2[0]) {
            type = 1;
        }

        /** 操作する配列の左側 */
        let leftLength = position1[type] < position2[type] ? position1[type] : position2[type];
        /** 操作する配列の右側 */
        let rightLength = (type == 0 ? this.current.width : this.current.height) - (position1[type] < position2[type] ? position2[type] : position1[type]) - size;
        /** 操作する配列の真ん中 */
        let middleLength = (type == 0 ? this.current.width : this.current.height) - leftLength - rightLength - 2 * size;

        /** それぞれのlengthに値があるか判定するフラグ(左中右:000) */
        let lengthFlag = (leftLength > 0 ? 1 : 0) * 100 + (middleLength > 0 ? 1 : 0) * 10 + (rightLength > 0 ? 1 : 0);
        /** サイズに対しての定型抜き型の番号 */
        let patternType = size == 1 ? 0 : (Math.log2(size) - 1) * 3 + 1;
        /** pullOutに渡す座標 */
        let position = [new Array(2).fill(0), new Array(2).fill(0), new Array(2).fill(0), new Array(2).fill(0), new Array(2).fill(0)];
        // lengthFlagから交換の仕方を決める
        switch (lengthFlag) {
            case 111:
                // L-E1-C-E2-R (5手)
                // E1-C-E2-R-L(L
                position[0][type] = leftLength - 256;
                position[0][Math.abs(type - 1)] = 0;
                this.#add(22, position[0], type == 0 ? 4 : 1);
                // E2-E1-C-R-L(E2
                position[1][type] = size + middleLength;
                position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.#add(patternType, position[1], type == 0 ? 2 : 3);
                // R-L-E2-E1-C(R-L
                position[2][type] = size * 2 + middleLength;
                position[2][Math.abs(type - 1)] = 0;
                this.#add(22, position[2], type == 0 ? 2 : 3);
                // R-L-E2-C-E1(E1
                position[3][type] = rightLength + leftLength + size;
                position[3][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.#add(patternType, position[3], type == 0 ? 4 : 1);
                // L-E2-C-E1-R(R
                position[4][type] = rightLength - 256;
                position[4][Math.abs(type - 1)] = 0;
                this.#add(22, position[4], type == 0 ? 4 : 1);
                break;
            case 11:
                // E1-C-E2-R (4手)
                // E2-E1-C-R(E2
                position[0][type] = size + middleLength;
                position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.#add(patternType, position[0], type == 0 ? 2 : 3);
                // R-E2-E1-C(R
                position[1][type] = size * 2 + middleLength;
                position[1][Math.abs(type - 1)] = 0;
                this.#add(22, position[1], type == 0 ? 2 : 3);
                // R-E2-C-E1(E1
                position[2][type] = rightLength + size;
                position[2][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.#add(patternType, position[2], type == 0 ? 4 : 1);
                // E2-C-E1-R(R
                position[3][type] = rightLength - 256;
                position[3][Math.abs(type - 1)] = 0;
                this.#add(22, position[3], type == 0 ? 4 : 1);
                break;
            case 110:
                // L-E1-C-E2(4手)
                // L-C-E2-E1(E1
                position[0][type] = leftLength;
                position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.#add(patternType, position[0], type == 0 ? 4 : 1);
                // C-E2-E1-L(L
                position[1][type] = leftLength - 256;
                position[1][Math.abs(type - 1)] = 0;
                this.#add(22, position[1], type == 0 ? 4 : 1);
                // E2-C-E1-L(E2
                position[2][type] = middleLength;
                position[2][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.#add(patternType, position[2], type == 0 ? 2 : 3);
                // L-E2-C-E1(L
                position[3][type] = size * 2 + middleLength;
                position[3][Math.abs(type - 1)] = 0;
                this.#add(22, position[3], type == 0 ? 2 : 3);
                break;
            case 101:
                if (priorityCell == 1) {
                    // L-E1-E2-R (3手)
                    // R-L-E1-E2(R
                    position[0][type] = leftLength + size * 2 + middleLength;
                    position[0][Math.abs(type - 1)] = 0;
                    this.#add(22, position[0], type == 0 ? 2 : 3);
                    // R-L-E2-E1(E1
                    position[1][type] = rightLength + leftLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.#add(patternType, position[1], type == 0 ? 4 : 1);
                    // L-E2-E1-R(R
                    position[2][type] = rightLength - 256;
                    position[2][Math.abs(type - 1)] = 0;
                    this.#add(22, position[2], type == 0 ? 4 : 1);
                }
                else {
                    // L-E1-E2-R (3手)
                    // E1-E2-R-L(L
                    position[0][type] = leftLength - 256;
                    position[0][Math.abs(type - 1)] = 0;
                    this.#add(22, position[0], type == 0 ? 4 : 1);
                    // E2-E1-R-L(E2
                    position[1][type] = size + middleLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.#add(patternType, position[1], type == 0 ? 2 : 3);
                    // L-E2-E1-R(L
                    position[2][type] = size * 2 + middleLength + rightLength;
                    position[2][Math.abs(type - 1)] = 0;
                    this.#add(22, position[2], type == 0 ? 2 : 3);
                }
                break;
            case 10:
                // E1-C-E2 (2手)
                // C-E2-E1(E1
                position[0][type] = 0;
                position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.#add(patternType, position[0], type == 0 ? 4 : 1);
                // E2-C-E1(E2
                position[1][type] = middleLength;
                position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.#add(patternType, position[1], type == 0 ? 2 : 3);
                break;
            case 100:
                if (priorityCell == 2) {
                    // L-E1-E2 (3手)
                    //E1-E2-L(L
                    position[0][type] = leftLength - 256;
                    position[0][Math.abs(type - 1)] = 0;
                    this.#add(22, position[0], type == 0 ? 4 : 1);
                    // E2-E1-L(E2
                    position[1][type] = size + middleLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.#add(patternType, position[1], type == 0 ? 2 : 3);
                    // L-E2-E1(L
                    position[2][type] = size * 2 + middleLength;
                    position[2][Math.abs(type - 1)] = 0;
                    this.#add(22, position[2], type == 0 ? 2 : 3);
                }
                else {
                    // L-E1-E2 (1手)
                    // L-E2-E1(E1
                    position[0][type] = leftLength;
                    position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.#add(patternType, position[0], type == 0 ? 4 : 1);
                }
                break;
            case 1:
                if (priorityCell == 1) {
                    // E1-E2-R (3手)
                    // R-E1-E2(R
                    position[0][type] = size * 2 + middleLength;
                    position[0][Math.abs(type - 1)] = 0;
                    this.#add(22, position[0], type == 0 ? 2 : 3);
                    // R-E2-E1(E1
                    position[1][type] = rightLength;
                    position[1][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.#add(patternType, position[1], type == 0 ? 4 : 1);
                    // E2-E1-R(R
                    position[2][type] = rightLength - 256;
                    position[2][Math.abs(type - 1)] = 0;
                    this.#add(22, position[2], type == 0 ? 4 : 1);
                }
                else {
                    // E1-E2-R (1手)
                    // E2-E1-R(E2
                    position[0][type] = size + middleLength;
                    position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.#add(patternType, position[0], type == 0 ? 2 : 3);
                }
                break;
            case 0:
                if (priorityCell == 2) {
                    //E1-E2(1手)
                    //E2-E1(E2
                    position[0][type] = size + middleLength;
                    position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.#add(patternType, position[0], type == 0 ? 2 : 3);
                }
                else {
                    // E1-E2 (1手)
                    // E2-E1(E1
                    position[0][type] = 0;
                    position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.#add(patternType, position[0], type == 0 ? 4 : 1);
                }
                break;
        }

        if (!isRecursived) {
            // スワップ操作を終えた時に操作履歴を記録する
            orderRelation.end = this.turn;
            board.after = this.current.formatCell();
            this.#addHistory(orderRelation, targetPosition, targetSize, board);
        }
    }

    /**
     * 全探索によって現在打てる最善手を操作するソート方法\
     * 一手進んだら、次手で一致数変化が著しく低下する
     */
    exhaustiveSort() {
        const cloneCurrent = () => {
            let copy = new Array(this.current.height);
            for (let i = 0; i < this.current.height; i++) {
                let temporaryArray = new Array(this.current.width);
                for (let j = 0; j < this.current.width; j++) {
                    temporaryArray[j] = this.current.array[i][j];
                }
                copy[i] = temporaryArray;
            }
            return copy;
        }

        let max = { number: 0, position: [0, 0], direction: 0, value: 0 };
        for (let i = 25; i < this.patterns.length; i++) {
            if (this.current.height * 0.75 < this.patterns[i].height) {
                for (let j = 1 - this.patterns[i].width; j < this.current.width / 4; j++) {
                    let matchValue = this.countMatchValue(this.#pullOut(new Board(cloneCurrent()), i, [j, 0], 4).array);
                    if (matchValue > max.value) {
                        max.number = i;
                        max.position = [j, 0];
                        max.direction = 4;
                        max.value = matchValue;
                    }
                }
                for (let j = this.current.width - 1; (this.current.width * 0.75) - this.patterns[i].width < j; j--) {
                    let matchValue = this.countMatchValue(this.#pullOut(new Board(cloneCurrent()), i, [j, 0], 2).array);
                    if (matchValue > max.value) {
                        max.number = i;
                        max.position = [j, 0];
                        max.direction = 2;
                        max.value = matchValue;
                    }
                }
            }
            if (this.current.width * 0.75 < this.patterns[i].width) {
                for (let j = 1 - this.patterns[i].height; j < this.current.height / 4; j++) {
                    let matchValue = this.countMatchValue(this.#pullOut(new Board(cloneCurrent()), i, [0, j], 1).array);
                    if (matchValue > max.value) {
                        max.number = i;
                        max.position = [0, j];
                        max.direction = 1;
                        max.value = matchValue;
                    }
                }
                for (let j = this.current.height - 1; (this.current.height * 0.75) - this.patterns[i].height < j; j--) {
                    let matchValue = this.countMatchValue(this.#pullOut(new Board(cloneCurrent()), i, [0, j], 3).array);
                    if (matchValue > max.value) {
                        max.number = i;
                        max.position = [0, j];
                        max.direction = 3;
                        max.value = matchValue;
                    }
                }
            }
        }
        //console.log("一致数変化:" + (max.value - this.countMatchValue()));
        this.#pullOut(this.current, max.number, max.position, max.direction);
    }

    /**
     * 0番目以外の定型抜き型を使いソートを行う
     * @param {ProgressOutput} callback 処理の進捗を出力するためのコールバック
     */
    straightSort(callback) {
        /**
         * 二つの座標とサイズを指定するとその領域をスワップしたときの増加量を計算する
         * @param {*} position1 一つ目の座標
         * @param {*} position2 二つ目の座標
         * @param {*} size 判定する領域の大きさ
         */
        const evaluate = (position1, position2, size) => {
            //2つの領域の現在と完成形の配列を作る
            let current = new Array(2).fill(0).map(array => array = new Array(size));
            let goal = new Array(2).fill(0).map(array => array = new Array(size));
            for (let i = 0; i < size; i++) {
                current[0][i] = this.current.array[position1[1] + i].slice(position1[0], position1[0] + size);
                current[1][i] = this.current.array[position2[1] + i].slice(position2[0], position2[0] + size);
                goal[0][i] = this.goal.array[position1[1] + i].slice(position1[0], position1[0] + size);
                goal[1][i] = this.goal.array[position2[1] + i].slice(position2[0], position2[0] + size);
            }
            //完成した4つの配列を組み合わせてその一致数を計算することで増加量を算出する
            return this.countMatchValue(current[0], goal[1]) + this.countMatchValue(current[1], goal[0]) - this.countMatchValue(current[0], goal[0]) - this.countMatchValue(current[1], goal[1]);
        }

        //定型抜き型をサイズが大きい方から順番に指定する
        [{ size: 128, min: 25 },
        { size: 64, min: 20 },
        { size: 32, min: 12 },
        { size: 16, min: 8 },
        { size: 8, min: 6 },
        { size: 4, min: 4 },
        { size: 2, min: 2 }].map(element => {
            let breakFlag = true;
            while (breakFlag) {
                breakFlag = false;
                //基準となる座標を一つ選択する
                for (let Y = 0; Y <= this.current.height - element.size; Y += element.size) {
                    for (let X = 0; X <= this.current.width - element.size; X += element.size) {
                        //ターゲットになるもう一つの座標を決める
                        //条件は以下の通り
                        //1.基準の座標から直線上にある座標
                        //2.最も一致数変化が増加する座標
                        /**ターゲットになった座標の情報 */
                        //初期値はvalueにelement.minを代入し増加量の最低保証を作成している
                        let max = { position: false, value: element.min };
                        //横にfor文を回してターゲットを探す
                        for (let x = 0; x <= this.current.width - element.size; x++) {
                            //基準と領域が被らないようにする
                            if ((x + element.size) <= X || (X + element.size) <= x) {
                                let value = evaluate([X, Y], [x, Y], element.size);
                                if (value > max.value) {
                                    max.value = value;
                                    max.position = [x, Y];
                                }
                            }
                        }
                        //縦にfor文を回してターゲットを探す
                        for (let y = 0; y <= this.current.height - element.size; y++) {
                            //基準と領域が被らないようにする
                            if ((y + element.size) <= Y || (Y + element.size) <= y) {
                                let value = evaluate([X, Y], [X, y], element.size);
                                if (value > max.value) {
                                    max.value = value;
                                    max.position = [X, y];
                                }
                            }
                        }
                        //最も増加量が大きい領域と基準の領域を交換する
                        if (max.position) {
                            this.#swap([X, Y], max.position, element.size);
                            breakFlag = true;
                        }
                    }
                }
            }
            callback?.call(this, this.progress());
        });
    }

    /**
     * 0番目の定型抜き型を使いソートを行う
     * @param {ProgressOutput} callback 処理の進捗を出力するためのコールバック
     */
    allSort(callback) {
        /**
         * 現在の配列の情報
         * @type {object[]}
         */
        let currentInfo = [];
        //現在と正解の配列の情報を取得する
        for (let i = 0; i < this.goal.height; i++) {
            for (let j = 0; j < this.goal.width; j++) {
                if (this.current.array[i][j] != this.goal.array[i][j]) {
                    currentInfo.push({ value: this.current.array[i][j], position: [j, i], endFlag: (i == 0 || i == this.goal.height - 1 || j == 0 || j == this.goal.width) ? true : false, selectFlag: this.current.array[i][j] == this.goal.array[i][j] ? true : false });
                }
            }
        }

        /**
         * 2つの座標を紐づけするための条件式
         * @type {boolean[]}
         */
        /* 
            1. 指定した要素から上下左右4マスにターゲットがあるか
            2. 指定した要素から十字方向にターゲットがあるか
            3. 指定した要素から右上左上右下左下にターゲットがあるか
            4. 指定した要素から太さ3マスの十字方向にターゲットがあるか
            5. 条件なし
            上から順に交換に必要な手順が少ない
        */
        const formula = [
            (position1, position2) => (position1[1] == position2[1]) && (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) || (position1[0] == position2[0]) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
            (position1, position2) => position1[0] == position2[0] || position1[1] == position2[1],
            (position1, position2) => (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
            (position1, position2) => position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1 || position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1,
            (position1, position2) => true
        ];

        /**
         * ここにpositionInfoと交換手順を記した関数を渡すとソートが行われる
         * @param {*} positionInfo ペアの組み合わせ等の座標情報
         * @param {*} func swapでソートを行う関数
         */
        const sort = (positionInfo, func) => {
            // 一個目の座標を順番に選択するためのfor文
            for (let i = 0; i < positionInfo[0].length; i++) {
                let result = new Array(positionInfo.length).fill(0);
                positionInfo[0][i].selectFlag = true;
                result[0] = positionInfo[0][i].position;
                // 要素の数値を順番に選択するためのfor文
                for (let j = 1; j < positionInfo.length; j++) {
                    // 順番に条件式が当てはまるか調べるためのfor文
                    for (let k = 0; k < formula.length; k++) {
                        // 座標を選択するためのfor文
                        for (let l = 0; l < positionInfo[j].length; l++) {
                            // 選択されていない座標と条件式に当てはまる座標同士を交換する
                            if (!positionInfo[j][l].selectFlag && formula[k](result[j - 1], positionInfo[j][l].position)) {
                                positionInfo[j][l].selectFlag = true;
                                result[j] = positionInfo[j][l].position;
                                break;
                            }
                        }
                        if (result[j] != 0) {
                            break;
                        }
                    }
                };
                func(result);
            };
            callback?.call(this, this.progress());
        };

        /* ペアのソート */
        [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(pair => {
            if (!this.terminationFlag) {
                let positionInfo = [[], []];
                // ペアの交換になる座標を配列にまとめる
                for (let i = 0; i < currentInfo.length; i++) {
                    if (!currentInfo[i].selectFlag) {
                        if (currentInfo[i].value == pair[0] && this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == pair[1]) {
                            positionInfo[0].push(currentInfo[i]);
                        }
                        else if (currentInfo[i].value == pair[1] && this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == pair[0]) {
                            positionInfo[1].push(currentInfo[i]);
                        }
                    }
                }

                // 配列の中にどちらも要素があれば交換を実行する
                if (positionInfo[0].length != 0 && positionInfo[1].length != 0) {
                    //長さが短い方を0に持ってくる
                    if (positionInfo[0].length > positionInfo[1].length) {
                        let swap = positionInfo[0];
                        positionInfo[0] = positionInfo[1];
                        positionInfo[1] = swap;
                    }

                    // 配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                    positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                    positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));

                    /** ペアのソートの交換の仕方 */
                    const pairSort = (result) => {
                        if (!this.terminationFlag) {
                            this.#swap(result[0], result[1]);
                        }
                    }

                    //ソートを行う
                    sort(positionInfo, pairSort);
                    currentInfo = currentInfo.filter(element => !element.selectFlag);
                }
            }
        });

        /* トリオのソート */
        [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].map(trio => {
            if (!this.terminationFlag) {
                let positionInfo = [[], [], []];
                /**
                 * key: 現在の座標の要素の数値
                 * 
                 * value: 選択された回数
                 * 
                 * goal: 正解の座標の要素の数値
                */
                let count = [
                    { key: trio[0], value: 0, goal: null },
                    { key: trio[1], value: 0, goal: null },
                    { key: trio[2], value: 0, goal: null }
                ];

                // トリオの交換になる座標を配列にまとめる
                for (let i = 0; i < currentInfo.length; i++) {
                    if (!currentInfo[i].selectFlag) {
                        if (currentInfo[i].value == trio[0] && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[1] || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[2])) {
                            count[0].value++;
                            positionInfo[0].push(currentInfo[i]);
                            if (!count[0].goal) {
                                count[0].goal = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                            }
                        }
                        else if (currentInfo[i].value == trio[1] && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[0] || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[2])) {
                            count[1].value++;
                            positionInfo[1].push(currentInfo[i]);
                            if (!count[1].goal) {
                                count[1].goal = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                            }
                        }
                        else if (currentInfo[i].value == trio[2] && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[0] || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == trio[1])) {
                            count[2].value++;
                            positionInfo[2].push(currentInfo[i]);
                            if (!count[2].goal) {
                                count[2].goal = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                            }
                        }
                    }
                }

                if (count.filter(count => count.goal === null).length == 0) {
                    // 1番目と2番目、2番目と3番目の交換を行うと揃うようにいい感じに要素を入れ替える
                    let min = 2;
                    for (let i = 0; i < 2; i++) {
                        if (count[i].value < count[min].value) {
                            min = i;
                        }
                    }
                    let swap = positionInfo[0];
                    positionInfo[0] = positionInfo[min];
                    positionInfo[min] = swap;
                    swap = count[0];
                    count[0] = count[min];
                    count[min] = swap;

                    // 配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                    positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                    positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));
                    positionInfo[2] = positionInfo[2].filter(element => !element.endFlag).concat(positionInfo[2].filter(element => element.endFlag));

                    /** トリオの交換の仕方 */
                    const trioSort = (result) => {
                        if (!this.terminationFlag) {
                            if (count[1].key == count[0].goal) {
                                this.#swap(result[0], result[1]);
                                this.#swap(result[1], result[2]);
                            }
                            else {
                                this.#swap(result[1], result[2]);
                                this.#swap(result[0], result[1]);
                            }
                        }
                    };

                    // ソートを行う
                    sort(positionInfo, trioSort);
                    currentInfo = currentInfo.filter(element => !element.selectFlag);
                }
            }
        });

        /* カルテットのソート */
        if (!this.terminationFlag) {
            let positionInfo = [[], [], [], []];
            let goalPattern = [null, null, null, null];

            // カルテットの交換になる座標を配列にまとめる
            for (let i = 0; i < currentInfo.length; i++) {
                if (!currentInfo[i].selectFlag) {
                    if (currentInfo[i].value == 0 && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 1 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 2 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 3)) {
                        positionInfo[0].push(currentInfo[i]);
                        if (!goalPattern[0]) {
                            goalPattern[0] = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                        }
                    }
                    else if (currentInfo[i].value == 1 && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 0 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 2 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 3)) {
                        positionInfo[1].push(currentInfo[i]);
                        if (!goalPattern[1]) {
                            goalPattern[1] = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                        }
                    }
                    else if (currentInfo[i].value == 2 && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 0 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 1 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 3)) {
                        positionInfo[2].push(currentInfo[i]);
                        if (!goalPattern[2]) {
                            goalPattern[2] = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                        }
                    }
                    else if (currentInfo[i].value == 3 && (this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 0 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 1 || this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]] == 2)) {
                        positionInfo[3].push(currentInfo[i]);
                        if (!goalPattern[3]) {
                            goalPattern[3] = this.goal.array[currentInfo[i].position[1]][currentInfo[i].position[0]];
                        }
                    }
                }
            }

            if (goalPattern.filter(element => element == null).length == 0) {
                // sort関数のformulaで評価した座標同士を使いたいので1番目,2番目の要素同士、3番目,4番目の要素同士を交換したら揃うように値をいい感じに入れ替える
                if (goalPattern[2] == 0) {
                    let swap = positionInfo[1];
                    positionInfo[1] = positionInfo[2];
                    positionInfo[2] = swap;
                    swap = goalPattern[1];
                    goalPattern[1] = goalPattern[2];
                    goalPattern[2] = swap;
                }
                else if (goalPattern[3] == 0) {
                    let swap = positionInfo[1];
                    positionInfo[1] = positionInfo[3];
                    positionInfo[3] = swap;
                    swap = goalPattern[1];
                    goalPattern[1] = goalPattern[3];
                    goalPattern[3] = swap;

                }

                // 配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));
                positionInfo[2] = positionInfo[2].filter(element => !element.endFlag).concat(positionInfo[2].filter(element => element.endFlag));
                positionInfo[3] = positionInfo[3].filter(element => element.endFlag).concat(positionInfo[3].filter(element => !element.endFlag));

                // カルテットの交換の仕方
                const quartetSort = (result) => {
                    if (!this.terminationFlag) {
                        this.#swap(result[0], result[1]);
                        if (goalPattern[0] == positionInfo[2][0].value) {
                            this.#swap(result[0], result[2]);
                        }
                        else if (goalPattern[0] == positionInfo[3][0].value) {
                            this.#swap(result[0], result[3]);
                        }
                        this.#swap(result[2], result[3]);
                    }
                };

                // ソートを行う
                sort(positionInfo, quartetSort);
            }
        }
    }

    /**
     * @callback ProgressOutput 処理の進捗を出力するためのコールバック
     * @param {number} matchValue 現在のセルの一致数
     * @callback SortStartAction `completeSort()`が開始したときに発火するアクション
     * @callback SortEndAction `completeSort()`が終了したときに発火するアクション
     * @param {number} second 実行時間
     */
    /**
     * 上記のソートを組み合わせたソート
     * @param {ProgressOutput} onProgress 処理の進捗を出力するためのコールバック
     * @param {SortStartAction} onStart 実行開始時発火するコールバック
     * @param {SortEndAction} onEnd 実行終了時発火するコールバック
     */
    completeSort(onProgress, onStart, onEnd) {
        onStart?.call(this);
        this.time = performance.now();

        this.straightSort(onProgress);
        this.allSort(onProgress);

        this.time = Math.floor(performance.now() - this.time) * 0.001;
        onEnd?.call(this, this.time);
    }
}

/**
 * 操作手順の内容を記録するクラス
 */
class Order {
    constructor(patternNumber, position, direction) {
        /**
         * 抜き型の番号
         * @type {number}
         */
        this.patternNumber = patternNumber;
        /**
         * 抜き型の座標[x,y]
         * @type {number[]}
         */
        this.position = position;
        /**
         * 方向
         * @type {number}
         */
        this.direction = direction;
    }
}

/**
 * 二次元配列を操作するためのクラス
 */
class Board {
    /**
     * Boardクラスの中の配列
     * @type {number[][]}
     */
    array = [[]];

    /**
     * Boardクラスの中の配列の高さ
     */
    get height() {
        switch (this.dimension) {
            //1次元配列または配列以外を読み込んだ場合の例外処理
            case 0:
            case 1:
                return 1;
            case 2:
                return this.array.length;
        }
    }

    /**
     * Boardクラスの中の配列の幅
     */
    get width() {
        switch (this.dimension) {
            // 1次元配列または配列以外を読み込んだ場合の例外処理
            case 0:
                return 1;
            case 1:
                return this.array.length;
            case 2:
                return this.array[0].length;
        }
    }

    /**
     * @param {number[][]} array 
     */
    constructor(array) {
        if (!array.length) {
            this.array = new Array(1).fill(array);
            /**配列の次元(0=数値 , 1=1次元配列 , 2=2次元配列) */
            this.dimension = 0;
        }
        else if (!array[0].length) {
            this.dimension = 1;
            this.array = array;
        }
        else {
            this.dimension = 2;
            this.array = array;
        }
    }

    /**
     * ボードのセルを送受信データ用にフォーマットする\
     * @returns `["0000", "1111", "0000", "1111"]`形式の`string[]`
     */
    formatCell() {
        return this.array.map((line) => line.toString().replace(/,/g, ""));
    }

    /**
     * Boardが保持している配列の転置行列
     */
    transpose() {
        //配列の大きさが1の場合を除外する
        if (this.dimension == 2) {
            this.array = this.array[0].map((_, i) => this.array.map(row => row[i]));
            if (typeof (this.array[0]) === 'number') {
                this.dimension = 1;
            }
        }
        else if (this.dimension == 1) {
            this.array = this.array.map(element => new Array(1).fill(element));
            this.dimension = 2;
        }
    }
}

module.exports.BoardData = BoardData;
module.exports.Board = Board;