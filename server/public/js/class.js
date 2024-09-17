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
    #increment = 0.01;

    /**
     * @param {HTMLElement} outputElement 経過時間表示を出力するHTML要素
     */
    constructor(outputElement) {
        this.outputElement = outputElement;
        this.reset();
    }

    /**
     * ストップウォッチ表示を作成する (`private method`)
     * @param {number} seconds 秒 
     * @returns `00:00.00`表示の文字列
     */
    #display(seconds) {
        /**
         * 入力引数が1の位のみの数字であった場合に10の位を0で埋める
         * @param {string} strValue 文字列に変換された数値
         * @returns 0埋めした文字列数値
         */
        const fillZero = strValue => strValue.length < 2 ? "0" + strValue : strValue;

        // 増分値に応じて小数第2位まで丸める
        seconds = Math.floor(seconds / this.#increment) * this.#increment;
        // 小数点以下を切り捨てる
        let truncated = Math.trunc(seconds);
        // 分、秒、ミリ秒表示を求める
        let min = Math.trunc(seconds / 60).toString();
        let sec = truncated < 60 ? truncated.toString() : (truncated % 60).toString();
        let ms = Math.round((seconds - truncated) / this.#increment).toString();
        
        return `${fillZero(min)}:${fillZero(sec)}.${fillZero(ms)}`;
    }

    /**
     * ストップウォッチ表示を作成する
     * @param {number} seconds 秒 
     */
    display(seconds) {
        this.outputElement.textContent = this.#display(seconds)
        return this;
    }

    /** ストップウォッチを開始する */
    start() {
        this.#id = setInterval(() => {
            this.#time += this.#increment;
            this.outputElement.textContent = this.#display(this.#time);
        }, this.#increment * 1000);
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
        this.outputElement.textContent = this.#display(0);
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
        };
        /** 数値を1つ減らす */
        const decrement = () => {
            if (this.value > this.min) this.value--;
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
                element.scrollIntoView({
                    block: "end",
                    inline: "nearest",
                    behavior: "smooth"
                });
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
    constructor(width = undefined, height = undefined, matchValue = undefined, id = "", orderCount = 0) {
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
         * @type {string} 
         */
        this.id = id;
        /**
         * 操作手数
         * @type {number} 
         */
        this.orderCount = orderCount;
    }
}