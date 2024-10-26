/**
 * 問題を解くためのクラス
 */
export default class BoardData {
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
        }

        else if (board == 0) {
            let problem = [];
            const data = JSON.parse(fs.readFileSync("./log/imgFile/problem.json"));
            problem = data.ejima.map(array => array.split(','));
            this.#board.goal = new Board(problem);
            this.#board.start = new Board(this.#shuffleBoard(problem));
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
    }

    /**
    * ボードをランダムに並び替える
    * @param {number[][]} array 並び替えるボード（2次元配列）
    */
    #shuffleBoard = array => {
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
     * 操作の終了フラグ
     * @type {boolean}
     */
    terminationFlag = false;

    /** 初期の一致数 */
    #initialMatchValue;

    /**
     * @param {Board} start 初期状態のボード
     * @param {Board} goal 解答のボード
     * @param {Board[]} patterns 使用する抜き型
     */
    constructor(start, goal, patterns) {
        // this.current = cloneDeep(start);
        this.current = new Board(structuredClone(start.array))
        this.goal = goal;
        this.turn = 0;
        this.patterns = patterns;
        this.#initialMatchValue = this.countMatchValue();
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
    * 抜き型で指定した座標を抜き、指定した方向に寄せ、隙間を抜いた要素で埋める関数
    * @param {Board} board　並べ替えたい2次元配列 
    * @param {number} patternNumber　抜き型の配列
    * @param {number[]} position　座標(x,y)
    * @param {number} direction 方向(上から時計回りに1~4の数値で割り当て)
    * @returns 
    */
    pullOut(board, patternNumber, position, direction) {
        //エラー処理
        /**エラーが起きたか判定する */
        //主にエラー内容が共存できる部分があるので必要である
        let errorFlag = false;
        //座標がx軸についてボードからはみ出しているかどうか判定する
        if ((position[0] < 0 && this.patterns[patternNumber].width <= -position[0]) || board.width <= position[0]) {
            errorFlag = true;
        }
        //座標がy軸についてボードからはみ出しているかどうか判定する
        if ((position[1] < 0 && this.patterns[patternNumber].height <= -position[1]) || board.height <= position[1]) {
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

    /**
     * インスタンスの`direction`を本番レギュレーションに合わせて変換する
     * @returns 本番レギュレーションの方向番号
     */
    get regularDirection() {
        return this.direction == 1 ? 0 :       // 上
                   this.direction == 2 ? 3 :       // 右
                       this.direction == 3 ? 1 :       // 下
                            this.direction == 4 ? 2 : NaN   // 左 (仮にどれでもない場合はNaN)
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

/*
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHkkkkkHHMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMkkkkkbbbbkkkkkbqmqMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMkkkkkkbbbkkkkkqkqqqmmMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHkkkkkkbkbbbbbkkqkkHmqmgMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHHHHqkkkkkkkkkkkqkHmqqmmgMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMN@@@@g@HHkkkkkkkHkqHkqqmmgMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNH@@@gg@@gHqqqkqmHqkkkHHgHMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM#3?TH@@@g@@@@HHHHdMg@@@@MMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMB><(<<?WMMMH@@@@@@H@MMMHTMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHy>;+z;>z<<?vYTBWMB9TTSI=>HMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHkHC>+v<<jd?z?zIzzzrRO<zyO=1(MMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMmKz;+y<>jCXI<;1wzlwtXkzzXkl+(MMMMMMMMMMM
MMMMMMMMMMMMNMMMMNMMMMNMMMMBIMH1;+d$+jSjHr<((zc1zIdHZlXkI<:MMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMHXWHWC+j1fz=dCdWb+_<<k<<zvNRzwWXz<JMMMMMMMMMM
MMMMMMMMNMMMMMMMMMMMMMNk9dkbp$1A$XS1zKzXbk(1<zdk<~?JMzwkXz<_MMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMNMM6dHkkS1wDjVWzdHzkbWy+c+xWSo_<JNzXwI1<(MMMMMMMMM
MMMMMMMMMMMMMMMMMMMMM81d@HHH1dNIWpWOZHkggHN+Jz1dpHy+++SOlOz1_HMMMMMMMM
MMMMMMMMMMMMMMMMMMMMDzdggqk$1dHdWHWOAdHH@@HyOzzzWkHmwxc0Izz?1(MMMMMMMM
MMMMMMMMMMMMMMMMMMM8wXWgmHH1zNHdqHWOkZWXgH@NvZwzwXHHHOzzO?zz+z(MMMMMMM
MMMMMMMMMMMMMMMMMMNkkWWqHbR=zkHdbbHwSWdKH@HHRWd1dRZHNRzw?XzI<?1<MMMMMM
MMMMMMMNMMMMNMMMMMMHkXHqpWHwwWkdHHSdkWdNdM##bdZzdp2XHMZzI<Ozz&1z+MMMMM
MMMMMMMMMMMMMMMMMMHWHHHHHHMWdXMHmmkHWHMNdH#MORvuWpIdbHDjZc+4OUm=tzHMMM
MMMMMMMMMMMMMMMMMHHHWWWmm@HfHHgMMHMNNMMNMHM0v1gMMHwfWp$dHZzOXO4HyrOHMM
MMMMMMMMMMMMMMHWZZXXWWHmHHWHqHgHMKMMMMMM#MNNNMNNdMNpfSjHmy<XwIOWqmwwMM
MMMMMMMMMMMWHgggg@@@gHgHpppWWWWHqXHWWMMMMMMNNNMMMMMNppbHHNyJWZwZWqHkXM
MMMMMMMMg@HkHggggm@@@HHVWWWWHHbHWHXHWHMMNNNMNNMMMMMMNbbbkHMXqSkwqkHmkd
MMMMMM@g@@HMMHHHMMHWZyZXWHXkWH-?UHgHkHMMMMMMMMMMMMMMMHkkkmHWWWmHWmmWHd
MMMMMMMMqHWVVW@MHyZZyZX@HZXWpH)`..?UMMgHMMMMMMMMMMMMMMNNNNWfWmmSWqm0HJ
MMMMM4XHpVVWHHMWZZyZXW@HZZfwHWb....~?H@gHHMMMMMMMMMMMMMMMMWWWm9dqHSdD+
MMMD(WHbppWMHMWyyXWZXHMWZZ\(WqHmXur~~:TMMRHMMMMMMMMMMMMMMMHHHaMMMNNHgM
MM@(WHHkbbHMMNfffWpWHHNyyy~.(WWWNNJu_:~` v@WNyOww&uVTHMMB=(MMMMMMMMMMM
MN>gHMgqqkMMMppppppWMMMWWk:~~7WMMHWHJzn...HnWNtttrvzuZZA&JMMMMMMMMMMMM
Nk+1zJMNNHMMNHMMMHpkJ&d1Ak>;<<<dWMMMkHNfdHDjNNOrzzuuZZyVfppkHMMMMMMMMM
NkJ9YY9UUWMHH#H@z17C7TTY96??>>>+=zWHHMNWNMWMMMKwZZyyVVVfppkqqmMMMMMMMM
MNp????>>?+TMMMr;;;;>>>>?>???????>1OwXHMUWHBOwHXyVfpppppbkqqkqqMMMMMMM
MMNc>>>>>>>>?vTN<;;;;;;>>>>>????????==zz====ld#XffppbbbkkqmmmmqMMMMMMM
MMMN?>>;>>>>??=Ow+;;;;;;;>>>>>>>???????????=ldHWkWqqqqqmgH@H@@HMMMMMMM
MMMMP>>>>>>>???==OO+<:;;;;;>>>>>>>>>???????1dHWHgH@@@H@MMHH###MMMMMMMM
MMMM#>>>>>>?????===llOuJ++>>;>>>>>>>>>>>>?1qMHggMMMMHHmggg@HH#MMMMMMMM
MMMMN<>>>>>??>?????==zdMMMMMNggg&&&+>?1+ugNNNNMMMMMbpbkkkmg@HMMMMMMMMM
MMMMMK>>>?>>>???????1dHMMMMMMMMMMMMMHHMMMMMMMMMMMMpffppbkm@HMMMMMMMMMM
MMMMMMm+>>>>>????1zdHWHMMMMMMMMMMMMMHHMMMMMMMMMM#WfVVfppkHMHMMMMMMMMMM
MMMMMMMNkA&&&zuaAXWXWkHMMMMMMMMMMMMMHHMMMMMMMMMMHXfffppkHHHMMMMMMMMMMM
MMMMMMMMNkWZZuuuuXXWbkgMMMMMMMMMMMMM@@MMMMMMMMMMSXpppbkHMHMMMMMMMMMMMM
MMMMMMMMMNHkWZuZZyfpbqgMMMMMMMMMMMMNHHMMMMMMMMMMWZWbkHHMMMMMMMMMMMMMMM
MMMMMMMMMMMNHkkXXXVfbH@MMMMMMMMMMMMN_JMMMMMMMMMMWXWHHHH@MMMMMMMMMMMMMM
MMMMMMMMMMMM9I=zvWHWHH@MMMMMMMMMMMMNHWMMMMMMMMMMyfWH@@HMMMMMMMMMMMMMMM
MMMMHMHHWMMkXwOlz==wWH@@MMMMMMMMMMMMMNNMMMMMMMMM#VWH@s@MMMMMMMMMMMMMMM
MMMHMNMMNMMHkkXXwzzZWH@MMMMMMMMMMMMMMMMMMMMMMMMNWH@@MMMMMMMMMMMMMMMMMM
MMM#MHHHMMMgHbpffXXWWHMMMMMMMMMMMMMMMMMMMMMMMMMpHg@MMMMMMMMMMMMMMMMMMM
MMM#XuWHHMH@gmqHHWWHHMMMMMMMMMMMMMMMMMMMMMMMMMNWm@MMMMMMMMMMMMMMMMMMMM
MMM#XuWMMMMMNMH@@@HMMMMMMMMMMMMMMMMMMMMMMMMMMMHmgMMMMMMMMMMMMMMMMMMMMM
MMMHWkXMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM#MMMMMMMMMMMMMMMMMMMM
MMNXkHZWMMWMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHHMM#MMMMMMMMMMMMMMMMMMMM
MMMNNNkWHMNMMMMMMMMMMMMMMMMMMMMMNMMMMMMMMMMMHMHMMHmMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMH@HgggH@mMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNMMMMMMH@HHHHHHM@HgQWMMMMMMMNMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMHMMMMMNHH@@MHNMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMNMMMMMMMMMMMMMMMMMMMMMMMMM
*/