/* -- 変数・クラス -- */

/**
 * 処理時間を計測するストップウォッチを作成するクラス
 * `00:00.00` 表示に対応する
 */
class StopWatch {
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
     * ストップウォッチ表示を作成する
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

    /** ストップウォッチを開始する */
    start() {
        this.#id = setInterval(() => {
            this.#time += this.#increment;
            this.outputElement.textContent = this.#display(this.#time);
        }, this.#increment * 1000);
    }

    /** ストップウォッチを停止する */
    stop() {
        clearInterval(this.#id);
    }

    /** ストップウォッチをリセットする */
    reset() {
        this.#time = 0;
        this.outputElement.textContent = this.#display(0);
    }
}

const buttons = {
    start: document.getElementById("start"),
    result: document.getElementById("result")
};
const logArea = document.getElementById("log");
const inputs = {
    width: document.getElementById("width"),
    height: document.getElementById("height")
}
const processTime = new StopWatch(document.getElementById("processTime"));

/**
 * @param {Object} results プロセスの処理結果を保存する
 * @param {number | undefined} results.matchValue 現在のセルの一致数
 * @param {string} results.filename 処理結果(送信データ)の出力ファイル名
 * @param {number} results.counts 操作手数
 */
const results = { matchValue: undefined, filename: "", counts: 0 }

/* -- DOMイベント -- */

buttons.start.addEventListener("click", async () => {
    logArea.textContent = "";
    processTime.reset();
    processTime.start();

    // エンドポイントにアクセス
    await fetch(`/start?width=${inputs.width.value}&height=${inputs.height.value}`)
        .then(response => {
            // 送信されるストリームを読み込むリーダー
            const reader = response.body.getReader();
            // バイナリのテキストを変換するデコーダー
            const decoder = new TextDecoder();
            // 送信されたテキストを読み込む
            return reader.read().then(

                // 読み込んだテキストデータを処理する
                function processText(result) {
                    // ストリームの読み取りが完了していれば終了する（再帰用の処理）
                    if (result.done) return;
                    // 読み込んでいないデータチャンクがあればテキストデータをデコードする
                    let decoded = decoder.decode(result.value);

                    // デコードデータがこの正規表現にマッチすれば「一致数」の出力である
                    results.matchValue = decoded.match(/^[0-9]+/)?.at(0);
                    
                    // デコードデータがこの正規表現にマッチすれば「出力ファイル名」と「処理手数」の出力である
                    let pathAndCounts = /^([A-Za-z0-9-]+\.json) ([0-9]+)/.exec(decoded);
                    // ファイル名、手数の分割代入
                    if (pathAndCounts) {
                        [results.filename, results.counts] = pathAndCounts.slice(1, 3);
                    }

                    // エラー処理：UIもうちょっと作ってから入れるようにする
                    // console.log(decoded.match(/error/i));

                    if (results.matchValue) {
                        // inputsはhtmlから入力したときのみ有効なので、実戦形式の際は入力データからとってこなければならない
                        let progress = results.matchValue / (inputs.width.value * inputs.height.value);
                        logArea.textContent = `${Math.round(progress * 100)}%`;
                    }
                    if (results.filename != "" && results.counts != 0) {
                        logArea.textContent += ` 手数: ${results.counts} 出力ファイル: ${results.filename}`;
                    }

                    // 再帰してストリームが終了するまで再度デコードする
                    return reader.read().then(processText);
                }
            );

        })
        .catch(err => console.error("Fetch failed.", err));

    // 処理時間を表示する（通信によって多少の誤差はある）
    processTime.stop();
});

buttons.result.addEventListener("click", () => {
    document.location.href = `/result?name=${results.filename}`;
});