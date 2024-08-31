const { padStart, min, values, first, result } = require("lodash");
const cloneDeep = require("lodash/cloneDeep");
const fs = require('fs');
const { count } = require("console");

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

    /** ボードの情報 */
    get board() {
        return this.#board;
    }

    /** 一般抜き型の情報 */
    get patterns() {
        return this.#patterns;
    }

    /**
     * @param {*} board 
     * @param {*} width 
     * @param {*} height 
     */
    constructor(board = null, pattern = null, width = 0, height = 0) {
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
        // 受信データを使用する場合、JSONからデータを取得する
        else {
            /**
             * 受信データのボード情報をコピー
             * @type {{}}
             */
            let board = board?.board;
            /**
             * 受信データの抜き型情報をコピー
             * @type {{}[]}
             */
            let patterns = board?.general?.patterns;

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

        if (pattern == null) {
            for (let i = 0; i < 256; i++) {
                let array = new Array(Math.floor(Math.random() * 256) + 1).fill(0);
                let width = Math.floor(Math.random() * 256) + 1;
                for (let j = 0; j < array.length; j++) {
                    array[j] = new Array(width).fill(0).map(value => Math.round(Math.random()));
                }
                this.#patterns.push(new Board(array));
            }
        }

        if (board == null && pattern == null) {
            let receptionData = {
                board: {
                    width: this.#board.start.width,
                    height: this.#board.start.height,
                    start: [],
                    goal: [],
                },
                general: {
                    n: this.#patterns.length - 25,
                    patterns: []
                }
            }

            for (let i = 0; i < this.#board.start.height; i++) {
                receptionData.board.start.push(this.#board.start.array[i].toString());
                receptionData.board.goal.push(this.#board.goal.array[i].toString());
            }

            for (let i = 25; i < this.#patterns.length; i++) {
                receptionData.general.patterns.push({
                    p: i,
                    width: this.#patterns[i].width,
                    height: this.#patterns[i].height,
                    cells: []
                });
            }

            for (let i = 25; i < this.#patterns.length; i++) {
                for (let j = 0; j < this.#patterns[i].array.length; j++) {
                    receptionData.general.patterns[i - 25].cells.push(this.#patterns[i].array[j].toString());
                }
            }

            fs.writeFile('./log/receptionLog.json', JSON.stringify(receptionData, undefined, ' '), 'utf-8', (err) => { });
        }

        this.answer = new Answer(this.#board.start, this.#board.goal, this.#patterns);
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
     * 使う抜き型のデータ
     * このクラスにも読み込んでおく
     * @type {Board[]}
     */
    pattern;

    /**
     * 操作の終了フラグ
     * @type {boolean}
     */
    terminationFlag = false;

    /**
     * @param {Board} start 初期状態のボード
     * @param {Board} goal 解答のボード
     * @param {Board[]} patterns 使用する抜き型
     */
    constructor(start, goal, patterns) {
        this.current = start;
        this.goal = goal;
        this.turn = 0;
        this.patterns = patterns;
    }

    /**
     * 一番最後のオーダー（最後に操作したボード）
     * コンソールに出力してデータを返す
     */
    get latestOrder() {
        console.log("現在" + (this.turn) + "手目");
        console.log(this.current.array);
        return this.current;
    }

    /**一番最後のOrderを表示する */
    // showLatestOrder() {
    //     console.log("現在" + (this.turn) + "手目");
    //     console.log(this.current.array);
    // }

    /**
     * 2つのボードにおけるセルの一致数を数える
     * @param {number[][]} array1 デフォルトで現在操作中のボード (current.array)
     * @param {number[][]} array2 デフォルトで解答のボード (goal.array)
     * @returns 一致数
     */
    countMatchValue(array1 = this.current.array, array2 = this.goal.array) {
        let match = 0;
        for (let i = 0; i < array1.length; i++) {
            for (let j = 0; j < array1[0].length; j++) {
                if (array1[i][j] == array2[i][j]) {
                    match++;
                }
            }
        }
        return match;
    }

    /**
     * 回答用の送信データを作成する
     * @param {boolean} [isOutput=false] ファイル出力するか (デフォルト `false`)
     * @param {Result | undefined} callback 結果を返却するコールバック
     */
    makeSendData(isOutput = false, callback) {

        /**
         * @callback Result
         * @param {string} output 出力したJSONファイル名
         * @param {number} n かかった手数
         * @param {[][]} ops 実際の操作手順
         */

        /**
         * 送信データの大枠
         */
        let sendData = {
            n: this.order.length,
            ops: []
        }

        // orderから各情報を照合して代入
        for (let i = 0; i < this.order.length; i++) {
            sendData.ops.push({
                p: this.order[i].patternNumber,
                x: this.order[i].position[0],
                y: this.order[i].position[1],
                s: 0
            });
        }

        // 抜き型の操作方向をレギュレーションに合わせる
        for (let i = 0; i < this.order.length; i++) {
            switch (this.order[i].direction) {
                case 1:
                    break;
                case 2:
                    sendData.ops[i].s = 3;
                    break;
                case 3:
                    sendData.ops[i].s = 1;
                    break;
                case 4:
                    sendData.ops[i].s = 2;
                    break;
            }
        }

        let fileName = 'sendLog.json';
        console.warn(isOutput);
        if (isOutput) {
            fs.writeFile(`./process/log/${fileName}`, JSON.stringify(sendData, undefined, ' '), 'utf-8', (err) => { });
        }

        callback?.call(this, fileName, sendData.n, sendData.ops);
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
        if (position[0] < 0 && this.patterns[patternNumber].width <= -position[0] || board.width <= position[0]) {
            console.error("pullOut関数:x座標が不正な値です(抜き型がボードから完全にはみ出しています");
            errorFlag = true;
        }
        //座標がy軸についてボードからはみ出しているかどうか判定する
        if (position[1] < 0 && this.patterns[patternNumber].height <= -position[1] || board.width <= position[1]) {
            console.error("pullOut関数:y座標が不正な値です(抜き型がボードから完全にはみ出しています");
            errorFlag = true
        }
        //エラーが起きた場合nullを返す
        if (errorFlag == true) {
            return null;
        }

        errorFlag = true;

        switch (direction) {
            case 1:
            case 3:
                for (let i = 0 < position[0] ? position[0] : 0; i < Math.min(board.width, this.patterns[patternNumber].width + position[0]); i++) {
                    let line = new Array(board.height).fill(0);
                    for (let j = 0; j < board.height; j++) {
                        if (patternNumber == 0) {
                            line[j] = { value: board.array[j][i], key: j - position[1] == 0 ? 1 : 0 };
                        }
                        else {
                            line[j] = { value: board.array[j][i], key: this.patterns[patternNumber].array[j - position[1]] ? this.patterns[patternNumber].array[j - position[1]][i - position[0]] ?? 0 : 0 };
                        }
                    }

                    if (line.filter(element => element.key == 1).length != 0) {
                        errorFlag = false;
                    }

                    if (direction == 1) {
                        line = line.filter(element => element.key == 0).concat(line.filter(element => element.key == 1));
                    }
                    else {
                        line = line.filter(element => element.key == 1).concat(line.filter(element => element.key == 0));
                    }
                    for (let j = 0; j < board.height; j++) {
                        board.array[j][i] = line[j].value;
                    }
                }
                if (errorFlag) {
                    console.log("操作された要素がありません");
                }
                return board;
            case 2:
            case 4:
                for (let i = 0 < position[1] ? position[1] : 0; i < Math.min(board.width, this.patterns[patternNumber].width + position[1]); i++) {
                    let line = new Array(board.width).fill(0);
                    for (let j = 0; j < board.width; j++) {
                        if (patternNumber == 0) {
                            line[j] = { value: board.array[i][j], key: j - position[0] == 0 ? 1 : 0 };
                        }
                        else {
                            line[j] = { value: board.array[i][j], key: this.patterns[patternNumber].array[i - position[1]] ? this.patterns[patternNumber].array[i - position[1]][j - position[0]] ?? 0 : 0 };
                        }
                    }

                    if (line.filter(element => element.key == 1).length != 0) {
                        errorFlag = false;
                    }

                    if (direction == 4) {
                        line = line.filter(element => element.key == 0).concat(line.filter(element => element.key == 1)).map(element => element.value);
                    }
                    else {
                        line = line.filter(element => element.key == 1).concat(line.filter(element => element.key == 0)).map(element => element.value);
                    }
                    board.array[i] = line;
                }
                if (errorFlag) {
                    console.log("操作された要素がありません");
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
    add(patternNumber, position, direction) {
        this.order.push(new Order(patternNumber, position, direction));
        this.current = this.#pullOut(this.current, patternNumber, position, direction);
        this.turn++;
    }

    /**
     * 一列に並んでいる2か所の要素を選択しその位置を入れ替える関数
     * @param {number[]} position1 1つ目の座標(x,y)
     * @param {number[]} position2 2つ目の座標(x,y)
     * @param {number} size 入れ替える配列の大きさ
     * @param {number} priorityCell 指定要素が重なっていたときどちらの要素の形を保つか(0=最短手,1=左側,2=右側)
     * @param {boolean} inspection エラー処理を行うかどうか
     * @returns
     */
    swap(position1, position2, size = 1, priorityCell = 0, inspection = true) {
        if (inspection == true) {
            // エラー処理
            /* エラーが起きたか判定する */
            // 主にエラー内容が共存できる部分があるので必要である
            let errorFlag = false;
            // それぞれのx座標がボードからはみ出していないか調べる
            if (position1[0] < 0 || this.current.width - size < position1[0]) {
                console.error("swap関数:position1のx座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            if (position2[0] < 0 || this.current.width - size < position2[0]) {
                console.error("swap関数:position2のx座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            // それぞれのy座標がボードからはみ出していないか調べる
            if (position1[1] < 0 || this.current.height - size < position1[1]) {
                console.error("swap関数:position1のy座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            if (position2[1] < 0 || this.current.height - size < position2[1]) {
                console.error("swap関数:position2のy座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            // サイズが不正な値でないか調べる
            if (size > 256) {
                console.error("swap関数:sizeが不正な値です(256より大きいサイズを指定することはできません)");
            }
            if (size == 0 ? false : !Number.isInteger(Math.log2(size))) {
                console.error("swap関数:sizeが不正な値です(2^nの値を指定してください)");
            }

            // フラグを参照して関数を中断する
            if (errorFlag == true) {
                return null;
            }
        }

        // 指定した場所が直線上に並んでいるか調べる
        // 直線上に並んでいなかったら斜めの交換用に処理を変える
        if (position1[0] != position2[0] && position1[1] != position2[1]) {
            //指定した要素同士が重なっていないか調べる
            if ((position1[0] < position2[0] ? position2[0] - position1[0] < size : position1[0] - position2[0] < size) && (position1[1] < position2[1] ? position2[1] - position1[1] < size : position1[1] - position2[1] < size)) {
                console.error("swap関数:直線的な交換でないのに指定した要素同士が重なっています");
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
                if (size == 1) {
                    switch (lengthFlag) {
                        case 111:
                            i = 5;
                            break;
                        case 110:
                        case 11:
                            i = 4;
                            break;
                        case 101:
                            i = 3;
                            break;
                        case 10:
                            i = 2;
                            break;
                        case 100:
                        case 1:
                        case 0:
                            i = 1;
                            break;
                    }
                }
                else {
                    switch (lengthFlag) {
                        case 111:
                            i = 4;
                            break;
                        case 110:
                        case 11:
                            i = 3;
                            break;
                        case 10:
                            i = 2;
                            break;
                        case 101:
                        case 100:
                        case 1:
                        case 0:
                            i = 1;
                            break;
                    }
                }
            }

            /** 要素の交換優先度 */
            let priority = [0, 1].map(i => setPriority(i));

            // 優先度の値によって交換の仕方を変える(関数の再帰を行っている)
            if (priority[0] < priority[1]) {
                this.swap(position[0], position[2], size, size == 1 ? 0 : (position[0][0] < position[2][0] ? 1 : 2), false);
                this.swap(position[1], position[2], size, 0, false);
                position2 = position[2];
                priorityCell = size == 1 ? 0 : (position[0][0] < position[2][0] ? 2 : 1);
            }
            else {
                this.swap(position[1], position[2], size, size == 1 ? 0 : (position[1][1] < position[2][1] ? 1 : 2), false);
                this.swap(position[0], position[2], size, 0, false);
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
                this.add(22, position[0], type == 0 ? 4 : 1);
                // E2-E1-C-R-L(E2
                position[1][type] = size + middleLength;
                position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position[1], type == 0 ? 2 : 3);
                // R-L-E2-E1-C(R-L
                position[2][type] = size * 2 + middleLength;
                position[2][Math.abs(type - 1)] = 0;
                this.add(22, position[2], type == 0 ? 2 : 3);
                // R-L-E2-C-E1(E1
                position[3][type] = rightLength + leftLength + size;
                position[3][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position[3], type == 0 ? 4 : 1);
                // L-E2-C-E1-R(R
                position[4][type] = rightLength - 256;
                position[4][Math.abs(type - 1)] = 0;
                this.add(22, position[4], type == 0 ? 4 : 1);
                break;
            case 11:
                // E1-C-E2-R (4手)
                // E2-E1-C-R(E2
                position[0][type] = size + middleLength;
                position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position[0], type == 0 ? 2 : 3);
                // R-E2-E1-C(R
                position[1][type] = size * 2 + middleLength;
                position[1][Math.abs(type - 1)] = 0;
                this.add(22, position[1], type == 0 ? 2 : 3);
                // R-E2-C-E1(E1
                position[2][type] = rightLength + size;
                position[2][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position[2], type == 0 ? 4 : 1);
                // E2-C-E1-R(R
                position[3][type] = rightLength - 256;
                position[3][Math.abs(type - 1)] = 0;
                this.add(22, position[3], type == 0 ? 4 : 1);
                break;
            case 110:
                // L-E1-C-E2(4手)
                // L-C-E2-E1(E1
                position[0][type] = leftLength;
                position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position[0], type == 0 ? 4 : 1);
                // C-E2-E1-L(L
                position[1][type] = leftLength - 256;
                position[1][Math.abs(type - 1)] = 0;
                this.add(22, position[1], type == 0 ? 4 : 1);
                // E2-C-E1-L(E2
                position[2][type] = middleLength;
                position[2][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position[2], type == 0 ? 2 : 3);
                // L-E2-C-E1(L
                position[3][type] = size * 2 + middleLength;
                position[3][Math.abs(type - 1)] = 0;
                this.add(22, position[3], type == 0 ? 2 : 3);
                break;
            case 101:
                if (priorityCell == 1) {
                    // L-E1-E2-R (3手)
                    // R-L-E1-E2(R
                    position[0][type] = leftLength + size * 2 + middleLength;
                    position[0][Math.abs(type - 1)] = 0;
                    this.add(22, position[0], type == 0 ? 2 : 3);
                    // R-L-E2-E1(E1
                    position[1][type] = rightLength + leftLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position[1], type == 0 ? 4 : 1);
                    // L-E2-E1-R(R
                    position[2][type] = rightLength - 256;
                    position[2][Math.abs(type - 1)] = 0;
                    this.add(22, position[2], type == 0 ? 4 : 1);
                }
                else {
                    // L-E1-E2-R (3手)
                    // E1-E2-R-L(L
                    position[0][type] = leftLength - 256;
                    position[0][Math.abs(type - 1)] = 0;
                    this.add(22, position[0], type == 0 ? 4 : 1);
                    // E2-E1-R-L(E2
                    position[1][type] = size + middleLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position[1], type == 0 ? 2 : 3);
                    // L-E2-E1-R(L
                    position[2][type] = size * 2 + middleLength + rightLength;
                    position[2][Math.abs(type - 1)] = 0;
                    this.add(22, position[2], type == 0 ? 2 : 3);
                }
                break;
            case 10:
                // E1-C-E2 (2手)
                // C-E2-E1(E1
                position[0][type] = 0;
                position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position[0], type == 0 ? 4 : 1);
                // E2-C-E1(E2
                position[1][type] = middleLength;
                position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position[1], type == 0 ? 2 : 3);
                break;
            case 100:
                if (priorityCell == 2) {
                    // L-E1-E2 (3手)
                    //E1-E2-L(L
                    position[0][type] = leftLength - 256;
                    position[0][Math.abs(type - 1)] = 0;
                    this.add(22, position[0], type == 0 ? 4 : 1);
                    // E2-E1-L(E2
                    position[1][type] = size + middleLength;
                    position[1][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position[1], type == 0 ? 2 : 3);
                    // L-E2-E1(L
                    position[2][type] = size * 2 + middleLength;
                    position[2][Math.abs(type - 1)] = 0;
                    this.add(22, position[2], type == 0 ? 2 : 3);
                }
                else {
                    // L-E1-E2 (1手)
                    // L-E2-E1(E1
                    position[0][type] = leftLength;
                    position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position[0], type == 0 ? 4 : 1);
                }
                break;
            case 1:
                if (priorityCell == 1) {
                    // E1-E2-R (3手)
                    // R-E1-E2(R
                    position[0][type] = size * 2 + middleLength;
                    position[0][Math.abs(type - 1)] = 0;
                    this.add(22, position[0], type == 0 ? 2 : 3);
                    // R-E2-E1(E1
                    position[1][type] = rightLength;
                    position[1][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position[1], type == 0 ? 4 : 1);
                    // E2-E1-R(R
                    position[2][type] = rightLength - 256;
                    position[2][Math.abs(type - 1)] = 0;
                    this.add(22, position[2], type == 0 ? 4 : 1);
                }
                else {
                    // E1-E2-R (1手)
                    // E2-E1-R(E2
                    position[0][type] = size + middleLength;
                    position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position[0], type == 0 ? 2 : 3);
                }
                break;
            case 0:
                if (priorityCell == 2) {
                    //E1-E2(1手)
                    //E2-E1(E2
                    position[0][type] = size + middleLength;
                    position[0][Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position[0], type == 0 ? 2 : 3);
                }
                else {
                    // E1-E2 (1手)
                    // E2-E1(E1
                    position[0][type] = 0;
                    position[0][Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position[0], type == 0 ? 4 : 1);
                }
                break;
        }
    }

    /**
     * 定型抜き型を使いソートを行う
     * @param {boolean} isOutputProgress 重いソート処理ごとに現在のセルの一致数を出力するか
     */
    allSort(isOutputProgress = false) {

        const outputProgress = () => { if(isOutputProgress) console.log(this.countMatchValue()) } ;

        // 128~2の大きさの定型抜き型を使ってソートを行う
        [{ size: 128, max: 30, limit: false },
        { size: 64, max: 25, limit: false },
        { size: 32, max: 20, limit: false },
        { size: 16, max: 12, limit: false },
        { size: 8, max: 8, limit: false },
        { size: 4, max: 4, limit: true },
        { size: 2, max: 2, limit: true },
        ].map(element => {
            // 分割できるか調べる
            if (this.current.height / element.size >= 2 && this.current.width / element.size >= 2) {
                /*
                let calcMatchValue = this.matchValue();
                let calcLength = this.turn;
                console.log("size" + element.size);
                */
                let boardInfo = new Array(Math.floor(this.current.height / element.size) * Math.floor(this.current.width / element.size)).fill(0);

                // 分割したボードの情報を整理する
                const initialization = (boardInfo) => {
                    let count = 0;
                    for (let i = 0; i < Math.floor(this.current.height / element.size); i++) {
                        for (let j = 0; j < Math.floor(this.current.width / element.size); j++) {
                            boardInfo[count] = { position: [j * element.size, i * element.size], matchValue: 0, currentArray: new Array(element.size).fill(0), goalArray: new Array(element.size).fill(0), selectFlag: false };
                            for (let k = 0; k < element.size; k++) {
                                let temporaryArray = [new Array(element.size).fill(0), new Array(element.size).fill(0)];
                                for (let l = 0; l < element.size; l++) {
                                    temporaryArray[0][l] = this.current.array[k + i * element.size][l + j * element.size];
                                    temporaryArray[1][l] = this.goal.array[k + i * element.size][l + j * element.size];
                                    if (this.current.array[k + i * element.size][l + j * element.size] == this.goal.array[k + i * element.size][l + j * element.size]) {
                                        boardInfo[count].matchValue++;
                                    }
                                }
                                boardInfo[count].currentArray[k] = temporaryArray[0];
                                boardInfo[count].goalArray[k] = temporaryArray[1];
                            }
                            count++;
                        }
                    }
                }

                // 一つの分割領域に対して有効でなくなるまで交換し続ける交換方法
                const loopSwap = (boardInfo, limit = false) => {
                    let max = element.max;
                    for (let i = 0; i < boardInfo.length; i++) {
                        let swapFlag = true;
                        while (swapFlag) {
                            swapFlag = false;
                            for (let j = 0; j < boardInfo.length; j++) {
                                // limitが有効になっている場合直線的な交換しか行わないようになる(手順が短くなる)
                                if ((i != j) && (limit ? (boardInfo[i].position[0] == boardInfo[j].position[0] || boardInfo[i].position[1] == boardInfo[j].position[1]) : true)) {
                                    let swapedMatchValue = this.countMatchValue(boardInfo[i].goalArray, boardInfo[j].currentArray);
                                    let targetSwapedMatchValue = this.countMatchValue(boardInfo[j].goalArray, boardInfo[i].currentArray);
                                    if ((swapedMatchValue + targetSwapedMatchValue - boardInfo[i].matchValue - boardInfo[j].matchValue) > max) {
                                        this.swap(boardInfo[i].position, boardInfo[j].position, element.size);
                                        let swap = boardInfo[i].currentArray;
                                        boardInfo[i].currentArray = boardInfo[j].currentArray;
                                        boardInfo[j].currentArray = swap;
                                        boardInfo[i].matchValue = swapedMatchValue;
                                        boardInfo[j].matchValue = targetSwapedMatchValue;
                                        swapFlag = true;
                                    }
                                }
                            }
                        }
                    }
                    outputProgress();
                }

                // 一つの分割領域に関して一番有効なもう一つの分割領域同士を一対一対応で交換する交換方法
                const injectionSwap = (boardInfo, limit = false) => {
                    for (let i = 0; i < boardInfo.length; i++) {
                        if (!boardInfo[i].selectFlag) {
                            boardInfo[i].selectFlag = true;
                            let max = element.max;
                            let maxPosition = false;
                            for (let j = 0; j < boardInfo.length; j++) {
                                //limitが有効になっている場合直線的な交換しか行わないようになる(手順が短くなる)
                                if (!boardInfo[j].selectFlag && (limit ? (boardInfo[i].position[0] == boardInfo[j].position[0] || boardInfo[i].position[1] == boardInfo[j].position[1]) : true)) {
                                    let swapedMatchValue = this.countMatchValue(boardInfo[i].goalArray, boardInfo[j].currentArray);
                                    let targetSwapedMatchValue = this.countMatchValue(boardInfo[j].goalArray, boardInfo[i].currentArray);
                                    if ((swapedMatchValue + targetSwapedMatchValue - boardInfo[i].matchValue - boardInfo[j].matchValue) > max) {
                                        max = swapedMatchValue + targetSwapedMatchValue - boardInfo[i].matchValue - boardInfo[j].matchValue;
                                        maxPosition = j;
                                    }
                                }
                            }
                            if (maxPosition) {
                                boardInfo[maxPosition].selectFlag = true;
                                this.swap(boardInfo[i].position, boardInfo[maxPosition].position, element.size);
                            }
                        }
                    }
                    outputProgress();
                }
                // loopSwapの方が交換回数が多くより厳密な交換ができるんじゃないかなぁ～と思ったので、両方作って組み合わせている

                initialization(boardInfo);

                // 分割数が少ないほどより厳密な交換を行う
                // しかしもともの問題が小さい場合、size=2のような終盤の交換も厳密にしてしまうので初期値にlimitを設定している
                if (boardInfo.length < 200) {
                    loopSwap(boardInfo, element.limit);
                    injectionSwap(boardInfo, element.limit);
                    initialization(boardInfo, element.limit);
                    injectionSwap(boardInfo, element.limit);
                }
                else if (boardInfo.length < 2000) {
                    loopSwap(boardInfo, true);
                    injectionSwap(boardInfo, true);
                }
                else {
                    injectionSwap(boardInfo, true);
                }

                /*
                console.log("一致数変化" + (this.matchValue() - calcMatchValue));
                console.log("手数変化" + (this.turn - calcLength));
                console.log("効率:" + (this.matchValue() - calcMatchValue) / (this.turn - calcLength));
                console.log("-------------");
                */
            }
        });

        // 1の大きさの定型抜き型のみを使ってソートを行う
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
        const formula = [(position1, position2) => (position1[1] == position2[1]) && (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) || (position1[0] == position2[0]) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
        (position1, position2) => position1[0] == position2[0] || position1[1] == position2[1],
        (position1, position2) => (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
        (position1, position2) => position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1 || position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1,
        (position1, position2) => true];

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
            outputProgress();
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
                            this.swap(result[0], result[1]);
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
                                this.swap(result[0], result[1]);
                                this.swap(result[1], result[2]);
                            }
                            else {
                                this.swap(result[1], result[2]);
                                this.swap(result[0], result[1]);
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
        if(!this.terminationFlag) {
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
                        this.swap(result[0], result[1]);
                        if (goalPattern[0] == positionInfo[2][0].value) {
                            this.swap(result[0], result[2]);
                        }
                        else if (goalPattern[0] == positionInfo[3][0].value) {
                            this.swap(result[0], result[3]);
                        }
                        this.swap(result[2], result[3]);
                    }
                };

                // ソートを行う
                sort(positionInfo, quartetSort);
            }
        }
        // this.makeSendData();
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
            //配列の中になにも入ってなかった時の例外処理
            case null:
                return null;
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
            // 配列の中になにも入ってなかった時の例外処理
            case null:
                return null;
            // 1次元配列または配列以外を読み込んだ場合の例外処理
            case 0:
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
        if (array === null || array == undefined) {
            console.error("Boardクラス:未定義の値を代入しました");
            return null;
        }
        else if (typeof (array) === 'number') {
            this.array = new Array(1).fill(array);
            /**配列の次元(0=数値 , 1=1次元配列 , null=値なし) */
            this.dimension = 0;
        }
        else if (typeof (array[0]) === 'number') {
            this.dimension = 1;
            this.array = array;
        }
        else {
            this.dimension = 2;
            this.array = array;
        }
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