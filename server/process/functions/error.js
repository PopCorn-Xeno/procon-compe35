/**
 * `class.js` - `Answer.#pullOut()`で使用するエラー
 */
class PullOutError extends Error {
    constructor(message) {
        super("[Function: pullout] > " + message);
        this.name = "PullOutError";
    }
}

/**
 * `class.js` - `Answer.#swap()`で使用するエラー
 */
class SwapError extends Error {
    constructor(message) {
        super("[Function: swap] > " + message);
        this.name = "SwapError";
    }
}

/**
 * @callback CatchHandler 例外をキャッチしたときに行うコールバック
 * @param {Error} error スローされたエラー
 */
/**
 * 例外をスローし、コールバックでハンドリング方法を指定する\
 * 指定がない場合プロセスを**強制終了**する
 * @param {Error} error エラー
 * @param {CatchHandler} handler エラーハンドラー
 */
function throwError(error, handler) {
    try {
        throw error;
    }
    catch (error) {
        const test = () => {
            console.error(error);
            process.exit(-1);
        }
        handler ? handler.call(this, error) : test();
    }
}

//#region モジュールエクスポート
module.exports.PullOutError = PullOutError;
module.exports.SwapError = SwapError;
module.exports.throwError = throwError;
module.exports.CatchHandler = this.CatchHandler;
//#endregion