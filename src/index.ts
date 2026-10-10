import express from "express";
import db from "@/db.js";

const app = express(); // アプリケーションを管理するオブジェクトの作成
const port = 3000;

app.use(express.json()); //JSON形式のリクエスト本文を読むための設定

//ルーティング
// "/"にgetリクエストがきたら処理を実行
app.get("/", (_req, res) => {
  // オブジェクトを渡すとJSONに変換して返す
  res.json({
    message: "簡易メモAPI",
  });
});

// "/notes"にgetリクエスト
app.get("/notes", (_req, res) => {
  const notes = db.prepare("SELECT * FROM notes").all();

  res.json(notes);
});

// webサーバの起動
app.listen(port, () => {
  console.log(`サーバー起動中 http://localhost:${port}`);
});
