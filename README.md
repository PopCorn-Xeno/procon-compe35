# 全国高専プロコン 第35回奈良大会 競技部門 呉高専 ソースリポジトリ
## 使用言語・ライブラリ・フォントと開発環境
### バックエンド
- Node.js
  - [Express](https://expressjs.com)
  - [lodash](https://lodash.com)
  
### フロントエンド
- JavaScript
  - [Grid.js](https://gridjs.io)
  - [JSON Viewer](https://github.com/renhongl/json-viewer-js?tab=readme-ov-file)
- CSS
- EJS

### フォント
- Noto Sans JP
- ヒラギノ角ゴ StdN
- DSEG7 Classic
- Source Code Pro
- Century Gothic
- Helvetica Neue

ソースコードの参考等は適宜ファイル内に記載

## 画面一覧
### ホーム
`index.ejs (/)`

デバッグモードの ON / OFF を切り替えることで練習と本番環境仕様でメインプログラムを動かすことが可能です。\
その他、様々なパラメータの設定や処理時間等の確認も可能です。
![screenshot of index, debug mode off](/server/public/images/index_debug_off.jpg)
![screenshot of index, debug mode on](/server/public/images/index_debug_on.jpg)

### 結果表示
`result.ejs (/result)`

保存したログから処理結果の確認ができます。
![screenshot of result](/server/public/images/result.png)

### ログ確認
`log.ejs (/log)`

保存したログの一覧、閲覧、削除ができます。
![screenshot of log](/server/public/images/log.png)

## 開発者
- メインプログラム・アルゴリズム：@stonekiln
- GUI・通信：@PopCorn-Xeno