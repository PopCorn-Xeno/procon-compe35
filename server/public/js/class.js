/**
 * 処理時間を計測するストップウォッチを作成するクラス\
 * `00:00.00` 表示に対応する
 */
export class StopWatch {
    /**
     * 経過時間を出力するHTMLエレメント
     * @type {HTMLElement}
     */
    outputElement = null;
    /**
     * 経過時間
     */
    #time = 0;
    /**
     * setIntervalのID
     */
    #id = 0;
    /**
     * 時間の増分値
     * 0.01s (10ms)
     */
    increment = 0.01;

    /**
     * @param {HTMLElement} outputElement 経過時間表示を出力するHTML要素
     */
    constructor(outputElement) {
        this.outputElement = outputElement;
        this.reset();
    }

    /**
     * ストップウォッチ表示の文字列を作成する
     * @param {number} seconds 秒 
     * @returns `00:00.00`表示の文字列
     */
    static format(seconds, increment = 0.01) {
        /**
         * 入力引数が1の位のみの数字であった場合に10の位を0で埋める
         * @param {string} strValue 文字列に変換された数値
         * @returns 0埋めした文字列数値
         */
        const fillZero = strValue => strValue.length < 2 ? "0" + strValue : strValue;
        const inversed = 1 / increment;
        // 増分値に応じて小数第2位まで丸める
        seconds = Math.floor(seconds * inversed) / inversed;
        // 小数点以下を切り捨てる
        let truncated = Math.trunc(seconds);
        // 分、秒、ミリ秒表示を求める
        let min = Math.trunc(seconds / 60).toString();
        let sec = truncated < 60 ? truncated.toString() : (truncated % 60).toString();
        let ms = Math.round((seconds - truncated) * inversed).toString();
       
        return `${fillZero(min)}:${fillZero(sec)}.${fillZero(ms)}`;
    }

    /**
     * ストップウォッチ表示を作成する (`private method`)\
     * インスタンス化した後の状態でストップウォッチ表示を利用する場合のメソッド
     * @param {number} seconds 秒 
     * @returns `00:00.00`表示の文字列
     */
    #format(seconds) {
        return StopWatch.format(seconds, this.increment);
    }

    /**
     * ストップウォッチ表示を作成し、要素に反映する
     * @param {number} seconds 秒 
     */
    display(seconds) {
        this.outputElement.textContent = this.#format(seconds)
        return this;
    }

    /** ストップウォッチを開始する */
    start() {
        this.#id = setInterval(() => {
            this.#time += this.increment;
            this.outputElement.textContent = this.#format(this.#time);
        }, this.increment * 1000);
        return this;
    }

    /** ストップウォッチを停止する */
    stop() {
        clearInterval(this.#id);
        return this;
    }

    /** ストップウォッチをリセットする */
    reset() {
        this.#time = 0;
        this.outputElement.textContent = this.#format(0);
        return this;
    }
}

/**
 * 数字で入力する設定項目を管理するクラス\
 * `<div class="number-field" id="">`をターゲットにする
 */
export class NumberField {
    /** サイズを数字で指定できるinput要素 */
    #inputField;
    /** 数値を1つ増やすbutton要素 */
    #incrementButton;
    /** 数値を1つ減らすbutton要素 */
    #decrementButton;
    /** 長押し判定時間 */
    #judgingTime = 0;
    /** 毎度お馴染み`setInterval`のID保存用 */
    #id = 0;
    /**
     * 値が変更されたときに発火するイベント\
     * コールバックが`Number`型の第1引数を持っていれば、現在の数値を渡す
     * @type {Function<Number> | null}
     */
    onValueChanged = null;

    /**
     * @param {HTMLElement} target `<div class="number-field" id="">`
     */
    constructor(target) {
        // フィールドを取得
        this.#inputField = target.querySelector("input");
        this.#incrementButton = target.querySelector(".increment-upper-triangle");
        this.#decrementButton = target.querySelector(".decrement-lower-triangle");

        /** 数値を1つ増やす */
        const increment = () => {
            if (this.value < this.max) this.value++;
            else if (!this.max) this.value++;
            this.onValueChanged?.call(this, this.value);
        };
        /** 数値を1つ減らす */
        const decrement = () => {
            if (this.value > this.min) this.value--;
            else if (!this.min) this.value--;
            this.onValueChanged?.call(this, this.value);
        };
        /**
         * ボタンを押しこまれたときのアクション
         * @param {Function} changeValueFunction `increment` または `decrement`
         */
        const onPressed = (changeValueFunction) => {
            this.#id = setInterval(() => {
                this.#judgingTime++;
                if(this.#judgingTime >= 10) changeValueFunction.call();
            }, 50);

            document.addEventListener("pointerup", () => {
                this.#judgingTime = 0;
                clearInterval(this.#id);
            }, { once: true });
        }

        this.#incrementButton.addEventListener("click", increment);
        this.#incrementButton.addEventListener("pointerdown", () => onPressed(increment));
        this.#decrementButton.addEventListener("click", decrement);
        this.#decrementButton.addEventListener("pointerdown", () => onPressed(decrement));
    }

    get value() {
        return Number.parseInt(this.#inputField.value);
    }

    set value(value) {
        this.#inputField.value = value;
    }

    get max() {
        return Number.parseInt(this.#inputField.max);
    }

    get min() {
        return Number.parseInt(this.#inputField.min);
    }

    get element() {
        return this.#inputField;
    }
}

/**
 * 入力系要素とその説明を関連付けるクラス
 */
export class InputDescription {
    /**
     * 要素の実体
     * @type {HTMLInputElement | NumberField}
     */
    element;
    /**
     * その要素固有のものと既定の説明テキスト
     */
    description = { unique: "", _default: "" };
    
    /**
     * @param {HTMLElement | NumberField} element 要素
     * @param {string} description 説明
     */
    constructor(element, description) {
        // ジェネリックの代わり
        if (element instanceof NumberField) {
            this.element = element?.element;
        }
        else if (element instanceof HTMLInputElement) {
            this.element = element;
        }
        else {
            throw new Error("A parameter `element` is must be instance of `NumberField` or `HTMLInputElement`");
        }
        this.description.unique = description;
    }

    /**
     * マウスカーソルが当たったり離れたりしたときのアクション
     * @callback OnMousehover
     * @param {string} text 説明テキスト
     * @returns {void}
     */

    /**
     * マウスカーソルが当たったり離れたりしたときのアクションを登録する
     * @param {OnMousehover} onMousehover コールバック
     * @returns インスタンス
     */
    setAction(onMousehover) {
        this.element.addEventListener("mouseover", () => {
            onMousehover.call(this, this.description.unique);
            this.element.addEventListener("mouseleave", () => {
                onMousehover.call(this, this.description._default);
            }, { once: true })
        });
        return this;
    }

    /**
     * 既定の説明を設定する
     * @param {string} description 説明テキスト
     * @returns インスタンス
     */
    setDefault(description) {
        this.description._default = description;
        return this;
    }
}

/**
 * 小数第1位までのパーセンテージを表示するプログレスバー
 */
export class ProgressBar {
    /**
     * ゲージ部分の要素
     * @type {HTMLElement}
     */
    #gauge;
    /**
     * パーセント (百分率)を表示する要素
     * @type {HTMLElement}
     */
    #percentage;
    
    /**
     * @param {HTMLElement} target ターゲット
     */
    constructor(target) {
        this.#gauge = target.querySelector(".gauge");
        this.#percentage = target.querySelector(".percentage");
        this.reset();
    }

    /**
     * 与えられた小数表記の割合を小数第1位までのパーセンテージにして表示する
     * @param {number} ratio 1以下の正の小数
     */
    progress(ratio) {
        const fillZero = strValue => strValue.length <= 2 ? strValue + ".0" : strValue;
        let percent = Math.round(ratio * 100 * 10) / 10;
        this.#gauge.style.width = `${percent}%`;
        this.#percentage.textContent = fillZero(percent.toString());
    }

    /** リセットする */
    reset() {
        this.#gauge.style.width = "0%";
        this.#percentage.textContent = "0.0"
    }
}

/**
 * 現在の処理ステータスを表示させるクラス
 */
export class Status {
    /**
     * @param {HTMLElement} target `<div id="status">`
     */
    constructor(target) {
        this.title = target.querySelector(".status-title");
        this.subtitle = target.querySelector(".status-subtitle");
    }

    /**
     * 表示を変える
     * @param {string} title 日本語タイトル
     * @param {string} subtitle 英語サブタイトル
     * @returns インスタンス
     */
    #change(title, subtitle) {
        this.title.textContent = title;
        this.subtitle.textContent = subtitle;
        return this;
    }
    /** スタンバイ */
    standBy() {
        return this.#change("実行待機", "STAND-BY");
    }
    /** 処理中 */
    process() {
        return this.#change("処理中", "PROCESS");
    }
    /** ファイナライズ */
    finalize() {
        return this.#change("事後処理", "FINALIZE")
    }
    /** 処理完了 */
    complete() {
        return this.#change("処理完了", "COMPLETE");
    }    
    /** エラー終了 */
    error() {
         return this.#change("異常終了", "ERROR");
    }
}

/**
 * コンソールウィンドウを使うためのクラス\
 * **文字列中の`'<', '>', '\n'`はエスケープまたは改行コードに置き換わる**
 */
export class ConsoleWindow {
    /**
     * @type {HTMLElement}
     */
    #console;
    #id = 0;
    isScrolled = false;

    constructor(target) {
        this.#console = target;

        // コンソールがスクロールされているかどうか判定するイベントを登録する
        this.#console.addEventListener("scroll", () => {
            this.isScrolled = true;
            clearTimeout(this.#id);
            // 250msごとにスクロールされているか否か判断する
            this.#id = setTimeout(() => {
                this.isScrolled = false;
            }, 250);
        });
    }
    
    /**
     * 子要素を追加してコンソール出力を再現する
     * @param {string} className 付与するクラス名
     * @param  {...any} data データ - 配列としてわたすと同じ段落で要素ごとに改行する
     */
    #append(className, ...data) {
        data.forEach(message => {
            let element = document.createElement("li");
            // 配列で渡された場合に、同じ段落内で改行させる
            if (Array.isArray(message)) {
                message.forEach(m => element.innerHTML += `${m}<br>`);
            }
            else {
                element.innerHTML = message.toString()
                                           .replace(/</g, "&lt;")
                                           .replace(/>/g, "&gt;")
                                           .replace(/\n/g, "<br>");
            }
            element.classList.add(className);
            element = this.#console.appendChild(element);
            //  スクロールしていないときだけ下部に強制スクロール
            if (!this.isScrolled) {
                // 新たに生成した要素が見える位置までスクロールする
                this.#console.scrollTo({
                    top: element.offsetTop,
                    behavior: "smooth"
                })
            }
        });
    }

    /**
     * 通常ログを出力する
     * @param  {...any} data 出力データ - 配列としてわたすと同じ段落で要素ごとに改行する
     */
    log(...data) {
        this.#append("log", ...data);
    }

    /**
     * エラーログを出力する
     * @param  {...any} data 出力データ - 配列としてわたすと同じ段落で要素ごとに改行する
     */
    error(...data) {
        this.#append("error", ...data);
    }
}

/**
 * 処理結果を保存するクラス
 */
export class Result {
    /**
     * @typedef RegExpPatterns
     * @property {RegExp} widthAndHeight マッチすれば「ボードの横幅」と「縦幅」の出力で、`256 x 256\n`などに対応
     * @property {RegExp} matchValue マッチすれば「一致数」の出力で、`1024\n`などに対応
     * @property {RegExp} idAndCount マッチすれば「出力ファイルのID」と「処理手数」の出力で、`2024-9-19_11-34-21 1994\n`または` 1994\n`に対応
     * @property {RegExp} error マッチすれば「エラー」の出力で、`error`が含まれている文字列に対応
     * @property {{input: RegExp, successed: RegExp, failed: RegExp}} send マッチすれば「回答データの送信状況」の出力
     */
    /**
     * 各フィールドを取得するための正規表現
     * @type {RegExpPatterns}
     */
    #patterns = Object.freeze({
        widthAndHeight: /^([0-9]{2,3}) x ([0-9]{2,3})\n$/,
        matchValue: /^([0-9]+\.*[0-9]*)\n$/,
        idAndCount: /^((([0-9-]{2,4}){2,3}-*){2})* ([0-9]+)\n$/,
        error: /error/gi,
        send: {
            input: /^Send .+ed\./,
            successed: /successed/,
            failed: /failed/
        }
    });

    /**
     * @typedef ResultPropertyCallbacks 各プロパティを取得できたときのコールバックを収めるオブジェクト
     * @property {OnWidthAndHeight | undefined} onWidthAndHeight ボードの横幅と縦幅を取得できた時発火するコールバック
     * @property {OnMatchValue | undefined} onMatchValue セルの一致数を取得できた時発火するコールバック
     * @property {OnIdAndCount | undefined} onIdAndCount 出力ファイルのIDと手数を取得できた時発火するコールバック
     * @property {OnError | undefined} onError エラーメッセージを取得できた時発火するコールバック
     * @property {OnSend | undefined} onSend 回答データの送信状況が取得できたとき発火するコールバック
     * 
     * @callback OnWidthAndHeight ボードの横幅と縦幅を取得できた時発火する
     * @param {number} width 横幅
     * @param {number} height 縦幅
     * @callback OnMatchValue セルの一致数を取得できた時発火する
     * @param {number} value 一致数
     * @callback OnIdAndCount 出力ファイルのIDと手数を取得できた時発火する
     * @param {string | undefined} id 出力ファイルのID (*上書き保存の設定になっていると`undefined`が返る*)
     * @param {number} count 手数
     * @callback OnError エラーメッセージを取得できた時発火する
     * @param {string} message エラーメッセージ
     * @callback OnSend 回答データの送信状況が取得できたとき発火する
     * @param {boolean} isSend 送信できたか
     * @param {string} message 送信ステータスメッセージ
     */
    /**
     * 各プロパティを取得できたときのコールバック
     * @type {ResultPropertyCallbacks}
     */
    #actions = {};

    constructor(width = undefined, height = undefined, matchValue = undefined, id = undefined, orderCount = undefined, error = undefined, isSend = false) {
        /**
         * ボードの横幅 - 受信データ使用時のみ利用
         * @type {number | undefined}
         */
        this.width = width;
        /**
         * ボードの縦幅 - 受信データ使用時のみ利用
         * @type {number | undefined}
         */
        this.height = height;
        /**
         * 現在のセルの一致数
         * @type {number | undefined} 
         */
        this.matchValue = matchValue;
        /**
         * 処理結果(送信データ)の出力ファイル名
         * @type {string | undefined} 
         */
        this.id = id;
        /**
         * 操作手数
         * @type {number | undefined} 
         */
        this.orderCount = orderCount;
        /**
         * エラーに関するメッセージ
         * @type {string | undefined}
         */
        this.error = error;

        /**
         * 回答が送られたどうかのフラグ
         * @type {boolean}
         */
        this.isSend = isSend;
    }

    
    /**
     * 各プロパティを取得できたときのコールバックを登録する
     * @param {ResultPropertyCallbacks} callbacks コールバック
     * @example <caption>初期化の際に併用</caption>
     * let result = new Result().setActions({
     *     onMatchValue: (value) => console.log(value), ...
     * });
     * @example <caption>後から追加</caption>
     * result.setActions({
     *     onWidthAndHeight: (width, height) => console.log(width * height)
     * });
     */
    setActions({ onWidthAndHeight, onMatchValue, onIdAndCount, onError, onSend }) {
        if (onWidthAndHeight) this.#actions.onWidthAndHeight = onWidthAndHeight;
        if (onMatchValue) this.#actions.onMatchValue = onMatchValue;
        if (onIdAndCount) this.#actions.onIdAndCount = onIdAndCount;
        if (onError) this.#actions.onError = onError;
        if (onSend) this.#actions.onSend = onSend;
        return this;
    }
    /**
     * 各プロパティを取得する\
     * それぞれ重複しない正規表現パターンを用いている
     * @param {string} text 検索対象の文字列
     */
    obtain(text) {
        if (this.#patterns.widthAndHeight.test(text)) {
            /* 1. [*original*, *width*, *height*, ...(残りはキーバリュー)] を得る
             * 2. slice(1)により、[*width*, *height*]のみを得る
             * 3. mapで数値に変換
             */
            [this.width, this.height] = this.#patterns.widthAndHeight.exec(text)
                                                                     .slice(1)
                                                                     .map(str => Number.parseInt(str));
            this.#actions?.onWidthAndHeight?.call(this, this.width, this.height);
        }
        if (this.#patterns.matchValue.test(text)) {
            [this.matchValue] = this.#patterns.matchValue.exec(text).slice(1).map(str => Number.parseFloat(str));
            this.#actions?.onMatchValue?.call(this, this.matchValue);
        }
        if (this.#patterns.idAndCount.test(text)) {
            let executed = this.#patterns.idAndCount.exec(text);
            [this.id, this.orderCount] = [executed.at(1), executed.at(-1)];
            this.#actions?.onIdAndCount?.call(this, this.id, this.orderCount);
        }
        if (this.#patterns.error.test(text)) {
            this.error = this.#patterns.error.exec(text).input;
            this.#actions?.onError?.call(this, this.error);
        }
        if (this.#patterns.send.input.test(text)) {
            this.isSend = this.#patterns.send.successed.test(text);
            this.#actions?.onSend?.call(this, this.isSend, text);
        }
    }
}