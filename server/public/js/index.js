import { StopWatch, NumberField, InputDescription, ProgressBar } from "./class.js"

/* -- 変数・クラス -- */

const buttons = {
    start: document.getElementById("start"),
    result: document.getElementById("result")
};
const logArea = document.getElementById("log");

/** 入力系要素 */
const inputs = {
    debugMode: new InputDescription(
        document.getElementById("debugMode"),
        "ONにすると、ランダムに問題を生成して処理を行います。"
    ),
    port: new InputDescription(
        new NumberField(document.getElementById("port")),
        "問題を送受信するサーバーのポート番号を設定します。簡易サーバー・本番環境どちらにも適用されます。"
    ),
    runSimpleServer: new InputDescription(
        document.getElementById("runSimpleServer"),
        "ONにすると簡易サーバーを上記ポートで起動します。OFFにすると簡易サーバーを切断します。"
    ),
    width: new InputDescription(
        new NumberField(document.getElementById("width")),
        "生成するボードの横幅を入力してください (32~256)。"
    ),
    height: new InputDescription(
        new NumberField(document.getElementById("height")),
        "生成するボードの縦幅を入力してください (32~256)。"
    ),
    isGenQuestion: new InputDescription(
        document.getElementById("isGenQuestion"),
        "ONにすると簡易サーバーの問題生成に用いる input.json をランダムに生成し、処理は実行しません。"
    ),
    isSavedLog: new InputDescription(
        document.getElementById("isSavedLog"),
        "ONにすると処理結果・送信データのログを保存します。"
    )
}

const descriptionArea = document.getElementById("description");
const defaultText = descriptionArea.textContent;
for (let key in inputs) {
    inputs[key].setDefault(defaultText)
               .setAction((text) => descriptionArea.textContent = text);
}

const options = document.querySelectorAll(".options");
const progressBar = new ProgressBar(document.getElementById("progressBar"));
const processTime = new StopWatch(document.getElementById("processTime"));

/**
 * @param {Object} results プロセスの処理結果を保存する
 * @param {number | undefined} results.matchValue 現在のセルの一致数
 * @param {string} results.filename 処理結果(送信データ)の出力ファイル名
 * @param {number} results.counts 操作手数
 */
const results = { matchValue: undefined, filename: "", counts: 0 }

/* -- DOMイベント -- */

document.addEventListener("DOMContentLoaded", () => {
    if (inputs.debugMode.element.checked) {
        options.item(0).classList.remove("active");
        options.item(1).classList.add("active");
    }
    else {
        options.item(0).classList.add("active");
        options.item(1).classList.remove("active");
    }
})

inputs.debugMode.element.addEventListener("change", () => {
    options.forEach(element => element.classList.toggle("active"));
});

buttons.start.addEventListener("click", async () => {
    logArea.textContent = "";
    processTime.reset();
    processTime.start();
    const width = inputs.width.element.value;
    const height = inputs.height.element.value;

    // エンドポイントにアクセス
    await fetch(`/start?width=${width}&height=${height}`)
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
                        progressBar.progress(results.matchValue / (width * height));
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