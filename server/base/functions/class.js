const { padStart, min, values, first, result } = require("lodash");
const cloneDeep = require("lodash/cloneDeep");
const fs = require('fs');

class BoardData {
    /**
     * この問題の解答
     * @type {Answer}
     */
    answer

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
     * @param {*} data 
     * @param {*} width 
     * @param {*} height 
     */
    constructor(data = null, width = 0, height = 0) {
        // 受信データを使用しなかった場合、問題をランダムで作るモードに移行する、また0に指定すると座標を表す数値を出力する
        if (data === null) {
            this.#makeRandom(height, width);
        }
        else if (data == 0) {
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

    terminationFlag = false;

    get orderLength() {
        return this.order.length - 1;
    }

    /**
     * @param {Board} start
     * @param {Board} goal
     * @param {Board[]} patterns
     */
    constructor(start, goal, patterns) {
        //初期状態はボードの状態だけが保存されることとする
        /**中にOrderクラスが入っている */
        this.order[0] = new Order(start, null, null, null);
        /**問題の完成形 */
        this.goal = goal;
        /**現在処理しているターン数 */
        this.turn = 0;
        //こちらにもformatPatternを読み込む
        this.patterns = patterns;
    }

    /**一番最後のOrderを表示する */
    latestOrder() {
        console.log("現在" + (this.orderLength) + "手目");
        console.log(this.order[this.orderLength].board.array);
    }

    match() {
        let match = 0;
        let boardFlag = new Array(this.goal.height).fill(0).map(array => array = new Array(this.goal.width).fill(4));
        for (let i = 0; i < this.goal.height; i++) {
            for (let j = 0; j < this.goal.width; j++) {
                if (this.order[this.orderLength].board.array[i][j] != this.goal.array[i][j]) {
                    boardFlag[i][j] = this.order[this.orderLength].board.array[i][j];
                }
                else {
                    match++;
                }
            }
        }
        console.log("一致数:" + match);
        console.log(boardFlag);
    }

    goalMatch() {
        let match = 0;
        let boardFlag = new Array(this.goal.height).fill(0).map(array => array = new Array(this.goal.width).fill(4));
        for (let i = 0; i < this.goal.height; i++) {
            for (let j = 0; j < this.goal.width; j++) {
                if (this.order[this.orderLength].board.array[i][j] != this.goal.array[i][j]) {
                    boardFlag[i][j] = this.goal.array[i][j];
                }
                else {
                    match++;
                }
            }
        }
        console.log(boardFlag);
    }

    matchValue(value = 0) {
        let match = 0;
        for (let i = 0; i < this.goal.height; i++) {
            for (let j = 0; j < this.goal.width; j++) {
                if (this.order[this.orderLength - value].board.array[i][j] == this.goal.array[i][j]) {
                    match++;
                }
            }
        }
        return match;
    }

    /** 
    * orderに操作内容をpushし追加で保存する関数
    * (右の条件で操作した後の配列,使用した抜き型の配列,座標,方向)
    * @param {number} patternNumber 抜き型の番号
    * @param {number[]} position 座標の値(x,y)
    * @param {number} direction 方向指定
    */
    add(patternNumber, position, direction) {
        this.order.push(new Order(this.#pullOut(this.order[this.turn].board, patternNumber, position, direction), patternNumber, position, direction));
        this.turn++;
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

        //主な処理内容
        //転置や変形などを行うため配列の内容をコピーする
        let clonePattern = cloneDeep(this.patterns[patternNumber]);
        //縦方向の操作の場合ボードと抜き型の転置、またx,y座標の交換を行う
        if (direction % 2 == 1) {
            board.transpose();
            clonePattern.transpose();
            let swap = position[0];
            position[0] = position[1];
            position[1] = swap;
        }

        //抜き型がボードからはみ出している場合その部分を切り取る
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

        //ボードの要素が変更されたか確認するために先にフラグを上げる
        errorFlag = true;

        /** n行目の配列に対してpullOutを返す関数*/
        const pull = (i) => {
            /**変形した後の抜き型 */
            let advancedPattern = [];

            //今現在の行が操作すべき行であるか確認する
            if (position[1] <= i && i < position[1] + clonePattern.height) {
                //抜き型についてBoardの横幅に合わせるために空白部分を0で埋める
                if (clonePattern.dimension == 2) {
                    advancedPattern = new Array(position[0]).fill(0).concat(clonePattern.array[i - position[1]].concat(new Array(board.width - clonePattern.width - position[0]).fill(0)));
                }
                else {
                    advancedPattern = new Array(position[0]).fill(0).concat(clonePattern.array.concat(new Array(board.width - clonePattern.width - position[0]).fill(0)));
                }
                //console.log(advancedPattern);
                //advancedPatternの中に1が一つでもある場合、配列の要素は移動するということなのでフラグを下げる
                if (advancedPattern.filter((element) => element == 1).length != 0 && errorFlag == true) {
                    errorFlag = false;
                }

                //連想配列にすることでadvancedPatternとボードの持つ配列の情報を紐づけ、フィルターで必要な値を選択し返すようにする
                let j = 0;
                /**抜き型で1の部分を並べた配列 */
                let pulledOutArray = advancedPattern.map(element => element = { 'key': element, 'value': board.array[i][j++] }).filter(element => element.key == 1).map(element => element.value);
                j = 0;
                /**抜き型で0の部分を並べた配列 */
                let temporaryArray = advancedPattern.map(element => element = { 'key': element, 'value': board.array[i][j++] }).filter(element => element.key == 0).map(element => element.value);

                //寄せ方によって結合する順番を変える
                switch (direction) {
                    case 1:
                    case 4:
                        return temporaryArray.concat(pulledOutArray);
                    case 2:
                    case 3:
                        return pulledOutArray.concat(temporaryArray);
                }
            }
            //操作すべきでない行はそのままの配列を返す
            else {
                return board.array[i];
            }
        }

        //pull関数を用いて全ての列に対して操作を行う
        //0,1,2,.....となるような配列を作り、mapに読み込ませn行目の作業を行う
        let array = new Array(board.height).fill(0).map((_, i) => i++).map(i => pull(i));

        //一度も要素がしなかった場合エラーを表示しnullを返す
        if (errorFlag == true) {
            console.error("pullOut関数:使用した抜き型の要素に1がなかったため有効な操作になりませんでした");
            return null;
        }

        let returnBoard = new Board(array);

        //縦方向の操作の場合最後に配列の転置を行う
        if (direction % 2 == 1) {
            returnBoard.transpose();
        }

        return returnBoard;
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
            /**エラーが起きたか判定する */
            //主にエラー内容が共存できる部分があるので必要である
            let errorFlag = false;
            //それぞれのx座標がボードからはみ出していないか調べる
            if (position1[0] < 0 || this.order[this.turn].board.width - size < position1[0]) {
                console.error("swap関数:position1のx座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            if (position2[0] < 0 || this.order[this.turn].board.width - size < position2[0]) {
                console.error("swap関数:position2のx座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            //それぞれのy座標がボードからはみ出していないか調べる
            if (position1[1] < 0 || this.order[this.turn].board.height - size < position1[1]) {
                console.error("swap関数:position1のy座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            if (position2[1] < 0 || this.order[this.turn].board.height - size < position2[1]) {
                console.error("swap関数:position2のy座標が不正な値です(配列の外側の要素を指定することはできません");
                errorFlag = true;
            }
            //サイズが不正な値でないか調べる
            if (size > 256) {
                console.error("swap関数:sizeが不正な値です(256より大きいサイズを指定することはできません)");
            }
            if (size == 0 ? false : !Number.isInteger(Math.log2(size))) {
                console.error("swap関数:sizeが不正な値です(2^nの値を指定してください)");
            }

            //フラグを参照して関数を中断する
            if (errorFlag == true) {
                return null;
            }
        }

        //指定した場所が直線上に並んでいるか調べる
        //直線上に並んでいなかったら斜めの交換用に処理を変える
        if (position1[0] != position2[0] && position1[1] != position2[1]) {
            //指定した要素同士が重なっていないか調べる
            if ((position1[0] < position2[0] ? position2[0] - position1[0] < size : position1[0] - position2[0] < size) && (position1[1] < position2[1] ? position2[1] - position1[1] < size : position1[1] - position2[1] < size)) {
                console.error("swap関数:直線的な交換でないのに指定した要素同士が重なっています");
                return null;
            }

            /**3つの座標が合わさった配列 */
            let position = [position1, position2, [position2[0], position1[1]]];

            const setPriority = (i) => {
                /**操作する配列の左側 */
                let leftLength = position[i][i] < position[2][i] ? position[i][i] : position[2][i];
                /**操作する配列の右側 */
                let rightLength = (i == 0 ? this.order[this.turn].board.width : this.order[this.turn].board.height) - (position[i][i] < position[2][i] ? position[2][i] : position[i][i]) - size;
                /**操作する配列の真ん中 */
                let middleLength = (i == 0 ? this.order[this.turn].board.width : this.order[this.turn].board.height) - leftLength - rightLength - 2 * size;
                /**それぞれのlengthに値があるか判定するフラグ(左中右:000) */
                let lengthFlag = (leftLength > 0 ? 1 : 0) * 100 + (middleLength > 0 ? 1 : 0) * 10 + (rightLength > 0 ? 1 : 0);
                //lengthFlagの値から優先度を設定する
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

            /**要素の交換優先度 */
            let priority = [0, 1].map(i => setPriority(i));

            //優先度の値によって交換の仕方を変える(関数の再帰を行っている)
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

        /**横列操作=0,縦列操作=1 */
        let type = 0;
        if (position1[0] == position2[0]) {
            type = 1;
        }

        /**操作する配列の左側 */
        let leftLength = position1[type] < position2[type] ? position1[type] : position2[type];
        /**操作する配列の右側 */
        let rightLength = (type == 0 ? this.order[this.turn].board.width : this.order[this.turn].board.height) - (position1[type] < position2[type] ? position2[type] : position1[type]) - size;
        /**操作する配列の真ん中 */
        let middleLength = (type == 0 ? this.order[this.turn].board.width : this.order[this.turn].board.height) - leftLength - rightLength - 2 * size;

        /**それぞれのlengthに値があるか判定するフラグ(左中右:000) */
        let lengthFlag = (leftLength > 0 ? 1 : 0) * 100 + (middleLength > 0 ? 1 : 0) * 10 + (rightLength > 0 ? 1 : 0);
        /**サイズに対しての定型抜き型の番号 */
        let patternType = size == 1 ? 0 : (Math.log2(size) - 1) * 3 + 1;
        /**pullOutに渡す座標 */
        let position = new Array(2).fill(0);
        //lengthFlagから交換の仕方を決める
        switch (lengthFlag) {
            case 111:
                //L-E1-C-E2-R(5手)
                //E1-C-E2-R-L(L
                position[type] = leftLength - 256;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 4 : 1);
                //E2-E1-C-R-L(E2
                position[type] = size + middleLength;
                position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 2 : 3);
                //R-L-E2-E1-C(R-L
                position[type] = size * 2 + middleLength;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 2 : 3);
                //R-L-E2-C-E1(E1
                position[type] = rightLength + leftLength + size;
                position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 4 : 1);
                //L-E2-C-E1-R(R
                position[type] = rightLength - 256;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 4 : 1);
                break;
            case 11:
                //E1-C-E2-R(4手)
                //E2-E1-C-R(E2
                position[type] = size + middleLength;
                position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 2 : 3);
                //R-E2-E1-C(R
                position[type] = size * 2 + middleLength;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 2 : 3);
                //R-E2-C-E1(E1
                position[type] = rightLength + size;
                position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 4 : 1);
                //E2-C-E1-R(R
                position[type] = rightLength - 256;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 4 : 1);
                break;
            case 110:
                //L-E1-C-E2(4手)
                //L-C-E2-E1(E1
                position[type] = leftLength;
                position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 4 : 1);
                //C-E2-E1-L(L
                position[type] = leftLength - 256;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 4 : 1);
                //E2-C-E1-L(E2
                position[type] = middleLength;
                position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 2 : 3);
                //L-E2-C-E1(L
                position[type] = size * 2 + middleLength;
                position[Math.abs(type - 1)] = 0;
                this.add(22, position, type == 0 ? 2 : 3);
                break;
            case 101:
                if (priorityCell == 1) {
                    //L-E1-E2-R(3手)
                    //R-L-E1-E2(R
                    position[type] = leftLength + size * 2 + middleLength;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 2 : 3);
                    //R-L-E2-E1(E1
                    position[type] = rightLength + leftLength;
                    position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 4 : 1);
                    //L-E2-E1-R(R
                    position[type] = rightLength - 256;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 4 : 1);
                }
                else {
                    //L-E1-E2-R(3手)
                    //E1-E2-R-L(L
                    position[type] = leftLength - 256;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 4 : 1);
                    //E2-E1-R-L(E2
                    position[type] = size + middleLength;
                    position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 2 : 3);
                    //L-E2-E1-R(L
                    position[type] = size * 2 + middleLength + rightLength;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 2 : 3);
                }
                break;
            case 10:
                //E1-C-E2(2手)
                //C-E2-E1(E1
                position[type] = 0;
                position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 4 : 1);
                //E2-C-E1(E2
                position[type] = middleLength;
                position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                this.add(patternType, position, type == 0 ? 2 : 3);
                break;
            case 100:
                if (priorityCell == 2) {
                    //L-E1-E2(3手)
                    //E1-E2-L(L
                    position[type] = leftLength - 256;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 4 : 1);
                    //E2-E1-L(E2
                    position[type] = size + middleLength;
                    position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 2 : 3);
                    //L-E2-E1(L
                    position[type] = size * 2 + middleLength;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 2 : 3);
                }
                else {
                    //L-E1-E2(1手)
                    //L-E2-E1(E1
                    position[type] = leftLength;
                    position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 4 : 1);
                }
                break;
            case 1:
                if (priorityCell == 1) {
                    //E1-E2-R(3手)
                    //R-E1-E2(R
                    position[type] = size * 2 + middleLength;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 2 : 3);
                    //R-E2-E1(E1
                    position[type] = rightLength;
                    position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 4 : 1);
                    //E2-E1-R(R
                    position[type] = rightLength - 256;
                    position[Math.abs(type - 1)] = 0;
                    this.add(22, position, type == 0 ? 4 : 1);
                }
                else {
                    //E1-E2-R(1手)
                    //E2-E1-R(E2
                    position[type] = size + middleLength;
                    position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 2 : 3);
                }
                break;
            case 0:
                if (priorityCell == 2) {
                    //E1-E2(1手)
                    //E2-E1(E2
                    position[type] = size + middleLength;
                    position[Math.abs(type - 1)] = position2[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 2 : 3);
                }
                else {
                    //E1-E2(1手)
                    //E2-E1(E1
                    position[type] = 0;
                    position[Math.abs(type - 1)] = position1[Math.abs(type - 1)];
                    this.add(patternType, position, type == 0 ? 4 : 1);
                }
                break;
        }
    }

    /**
     * 0番目の定型抜き型のみを使ってソートを行う
     */
    allSort() {
        /**
         * 現在の配列の情報
         * @type {object[]}
         */
        let currentInfo = [];
        /**
         * 正解の配列の情報
         * @type {object[]}
         */
        let goalInfo = [];
        //現在と正解の配列の情報を取得する
        for (let i = 0; i < this.goal.height; i++) {
            for (let j = 0; j < this.goal.width; j++) {
                if (this.order[this.orderLength].board.array[i][j] != this.goal.array[i][j]) {
                    currentInfo.push({ value: this.order[this.orderLength].board.array[i][j], position: [j, i], endFlag: (i == 0 || i == this.goal.height - 1 || j == 0 || j == this.goal.width) ? true : false, selectFlag: this.order[this.orderLength].board.array[i][j] == this.goal.array[i][j] ? true : false });
                    goalInfo.push({ value: this.goal.array[i][j], position: [j, i], endFlag: (i == 0 || i == this.goal.height - 1 || j == 0 || j == this.goal.width) ? true : false, selectFlag: this.order[this.orderLength].board.array[i][j] == this.goal.array[i][j] ? true : false });
                }
            }
        }

        /**
         * 2つの座標を紐づけするための条件式
         * @type {boolean[]}
         */
        /* 
        1.指定した要素から上下左右4マスにターゲットがあるか
        2.指定した要素から十字方向にターゲットがあるか
        3.指定した要素から右上左上右下左下にターゲットがあるか
        4.指定した要素から太さ3マスの十字方向にターゲットがあるか
        5.条件なし
        上から順に交換に必要な手順が少ない
        */
        const formula = [(position1, position2) => (position1[1] == position2[1]) && (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) || (position1[0] == position2[0]) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
        (position1, position2) => position1[0] == position2[0] || position1[1] == position2[1],
        (position1, position2) => (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1) && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1),
        (position1, position2) => position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1 || position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1,
        (position1, position2) => true];

        /**
         * ここにpositionInfoと交換手順を記した関数を渡すとソートが行われる
         * @param {*} positionInfo 
         * @param {*} func 
         */
        const sort = (positionInfo, func) => {
            //一個目の座標を順番に選択するためのfor文
            for (let i = 0; i < positionInfo[0].length; i++) {
                let result = new Array(positionInfo.length).fill(0);
                positionInfo[0][i].selectFlag = true;
                result[0] = positionInfo[0][i].position;
                //要素の数値を順番に選択するためのfor文
                for (let j = 1; j < positionInfo.length; j++) {
                    //順番に条件式が当てはまるか調べるためのfor文
                    for (let k = 0; k < formula.length; k++) {
                        //座標を選択するためのfor文
                        for (let l = 0; l < positionInfo[j].length; l++) {
                            //選択されていない座標と条件式に当てはまる座標同士を交換する
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
        };

        /** 交換済みの座標を削除する*/
        const memoryRelease = () => {
            //現在の一致情報しか操作されていないので、ゴールの一致情報のフラグも上げる
            for (let i = 0; i < currentInfo.length; i++) {
                if (currentInfo[i].selectFlag) {
                    goalInfo[i].selectFlag = true;
                }
            }
            //filterメソッドによって選択済みの要素を削除する
            currentInfo = currentInfo.filter(element => !element.selectFlag);
            goalInfo = goalInfo.filter(element => !element.selectFlag);
        };

        /** 許容手数量を超えたら一致数を最大値まで遡って強制終了させる関数*/
        const forcedTermination = () => {
            //許容手数量を超えているか検知する
            if (this.order.length > 30000) {
                //三万手までカットする
                this.order = this.order.slice(0, 30000);
                let max = this.matchValue();
                let maxTurn = this.order.length;
                //手数の後ろから比較して一致数の最大値を決める(swap関数の性質上15手以上のスワップはないので安牌を取って20まで遡ったら比較をやめる)
                for (let i = 0; i < 20; i++) {
                    if (this.matchValue(i) > max) {
                        max = this.matchValue(i);
                        maxTurn = -i;
                    }
                }
                //最大値の手までカットする
                this.order = this.order.slice(0, maxTurn);
                this.terminationFlag = true;
                console.log("許容手数量を超えたためプログラムを終了します");
            }
        }

        [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]].map(pair => {
            if (!this.terminationFlag) {
                let positionInfo = [[], []];
                //ペアの交換になる座標を配列にまとめる
                for (let i = 0; i < currentInfo.length; i++) {
                    if (!currentInfo[i].selectFlag) {
                        if (currentInfo[i].value == pair[0] && goalInfo[i].value == pair[1]) {
                            positionInfo[0].push(currentInfo[i]);
                        }
                        else if (currentInfo[i].value == pair[1] && goalInfo[i].value == pair[0]) {
                            positionInfo[1].push(currentInfo[i]);
                        }
                    }
                }

                //配列の中にどちらも要素があれば交換を実行する
                if (positionInfo[0].length != 0 && positionInfo[1].length != 0) {
                    //長さが短い方を0に持ってくる
                    if (positionInfo[0].length > positionInfo[1].length) {
                        let swap = positionInfo[0];
                        positionInfo[0] = positionInfo[1];
                        positionInfo[1] = swap;
                    }

                    //配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                    positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                    positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));

                    //ペアのソートの交換の仕方
                    const pairSort = (result) => {
                        if (!this.terminationFlag) {
                            this.swap(result[0], result[1]);
                            forcedTermination();
                        }
                    }

                    //ソートを行う
                    sort(positionInfo, pairSort);
                    memoryRelease();
                }
            }
        });

        [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]].map(trio => {
            if (!this.terminationFlag) {
                let positionInfo = [[], [], []];
                /*
                key=現在の座標の要素の数値
                value=選択された回数
                goal=正解の座標の要素の数値
                */
                let count = [{ key: trio[0], value: 0, goal: null }, { key: trio[1], value: 0, goal: null }, { key: trio[2], value: 0, goal: null }];

                //トリオの交換になる座標を配列にまとめる
                for (let j = 0; j < currentInfo.length; j++) {
                    if (!currentInfo[j].selectFlag) {
                        if (currentInfo[j].value == trio[0] && (goalInfo[j].value == trio[1] || goalInfo[j].value == trio[2])) {
                            count[0].value++;
                            positionInfo[0].push(currentInfo[j]);
                            if (!count[0].goal) {
                                count[0].goal = goalInfo[j].value;
                            }
                        }
                        else if (currentInfo[j].value == trio[1] && (goalInfo[j].value == trio[0] || goalInfo[j].value == trio[2])) {
                            count[1].value++;
                            positionInfo[1].push(currentInfo[j]);
                            if (!count[1].goal) {
                                count[1].goal = goalInfo[j].value;
                            }
                        }
                        else if (currentInfo[j].value == trio[2] && (goalInfo[j].value == trio[0] || goalInfo[j].value == trio[1])) {
                            count[2].value++;
                            positionInfo[2].push(currentInfo[j]);
                            if (!count[2].goal) {
                                count[2].goal = goalInfo[j].value;
                            }
                        }
                    }
                }

                if (count.filter(count => count.goal === null).length == 0) {
                    //1番目と2番目、2番目と3番目の交換を行うと揃うようにいい感じに要素を入れ替える
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

                    //配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                    positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                    positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));
                    positionInfo[2] = positionInfo[2].filter(element => !element.endFlag).concat(positionInfo[2].filter(element => element.endFlag));

                    //トリオの交換の仕方
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
                            forcedTermination();
                        }
                    };

                    //ソートを行う
                    sort(positionInfo, trioSort);
                    memoryRelease();
                }
            }
        });

        if (!this.terminationFlag) {
            let positionInfo = [[], [], [], []];
            let goalPattern = [null, null, null, null];

            //カルテットの交換になる座標を配列にまとめる
            for (let i = 0; i < currentInfo.length; i++) {
                if (!currentInfo[i].selectFlag) {
                    if (currentInfo[i].value == 0 && (goalInfo[i].value == 1 || goalInfo[i].value == 2 || goalInfo[i].value == 3)) {
                        positionInfo[0].push(currentInfo[i]);
                        if (!goalPattern[0]) {
                            goalPattern[0] = goalInfo[i].value;
                        }
                    }
                    else if (currentInfo[i].value == 1 && (goalInfo[i].value == 0 || goalInfo[i].value == 2 || goalInfo[i].value == 3)) {
                        positionInfo[1].push(currentInfo[i]);
                        if (!goalPattern[1]) {
                            goalPattern[1] = goalInfo[i].value;
                        }
                    }
                    else if (currentInfo[i].value == 2 && (goalInfo[i].value == 0 || goalInfo[i].value == 1 || goalInfo[i].value == 3)) {
                        positionInfo[2].push(currentInfo[i]);
                        if (!goalPattern[2]) {
                            goalPattern[2] = goalInfo[i].value;
                        }
                    }
                    else if (currentInfo[i].value == 3 && (goalInfo[i].value == 0 || goalInfo[i].value == 1 || goalInfo[i].value == 2)) {
                        positionInfo[3].push(currentInfo[i]);
                        if (!goalPattern[3]) {
                            goalPattern[3] = goalInfo[i].value;
                        }
                    }
                }
            }

            if (goalPattern.filter(element => element == null).length == 0) {
                //sort関数のformulaで評価した座標同士を使いたいので1番目,2番目の要素同士、3番目,4番目の要素同士を交換したら揃うように値をいい感じに入れ替える
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

                //配列の端にある要素と中にある要素をペアにしたいのでendFlagより順番を変更する
                positionInfo[0] = positionInfo[0].filter(element => !element.endFlag).concat(positionInfo[0].filter(element => element.endFlag));
                positionInfo[1] = positionInfo[1].filter(element => element.endFlag).concat(positionInfo[1].filter(element => !element.endFlag));
                positionInfo[2] = positionInfo[2].filter(element => !element.endFlag).concat(positionInfo[2].filter(element => element.endFlag));
                positionInfo[3] = positionInfo[3].filter(element => element.endFlag).concat(positionInfo[3].filter(element => !element.endFlag));

                //カルテットの交換の仕方
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
                        forcedTermination();
                    }
                };

                //ソートを行う
                sort(positionInfo, quartetSort);
            }
        }
    }
}

/**
 * 操作手順の内容を記録するクラス
 */
class Order {
    constructor(board, patternNumber, position, direction) {
        /**
         * 操作手順の内容
         * @type {Board}
         */
        this.board = board;
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
     *Boardクラスの中の配列
     */
    array = [[]];

    /**
     *Boardクラスの中の配列の高さ
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
     *Boardクラスの中の配列の幅
     */
    get width() {
        switch (this.dimension) {
            //配列の中になにも入ってなかった時の例外処理
            case null:
                return null;
            //1次元配列または配列以外を読み込んだ場合の例外処理
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