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

// 一覧取得しJSONで返す
app.get("/notes", (_req, res) => {
  const notes = db.prepare("SELECT * FROM notes").all(); //prepare:SQLを実行する準備。.all: 一覧取得

  res.json(notes);
});

// webサーバの起動
app.listen(port, () => {
  console.log(`サーバー起動中 http://localhost:${port}`);
});

/**
 * 新規データをテーブルに保存しJSONとして返す
 * curl -X POST http://localhost:3000/notes -H "Content-Type: application/json" -d '{"title":"買い物","content":"牛乳を買う"}'
 */
app.post("/notes", (req, res) => {
  const { title, content } = req.body;

  // SQLiteに保存
  // SQL部分： notesテーブルに(title, content)カラムのデータを入れる。(?, ?)で値はあとで渡すことを示す
  // .run: prepareでSQL文を準備する返ってくるStatementオブジェクトに対して、runでSQLを実行する。
  const result = db
    .prepare(
      `
    INSERT INTO notes (title, content)
    VALUES (?, ?)
    `,
    )
    .run(title, content);

  // 保存した内容をJSONで返す（201:新しいリソースを作成）
  res.status(201).json({
    id: result.lastInsertRowid,
    title,
    content,
  });
});

/**
 * 指定されたIDのレコードを検索しJSONで返す
 * curl http://localhost:3000/notes/1
 */
app.get("/notes/:id", (req, res) => {
  const id = Number(req.params.id); // /notes/3 にアクセスすると文字列"3"が返ってくる

  // ?:プレースホルダー。.get(id)の値が後から入る。SQLインジェクション対策。
  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(id); //.get()は1件のみ取得。

  if (!note) {
    return res.status(404).json({
      message: "Note not found",
    });
  }

  res.json(note);
});

/**
 * 既存のレコードを更新し、新しくなったレコードのJSONを返す
 * curl -X PUT http://localhost:3000/notes/1 -H "Content-Type: application/json" -d '{"title":"買い物メモ","content":"牛乳と卵を買う"}'
 * (-H: ヘッダー、 -d: データ)
 */
app.put("/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body;

  // tableでidが一致するレコードを更新する
  const result = db
    .prepare(
      `
      UPDATE notes
      SET title = ?, content = ?
      WHERE id = ?
    `,
    )
    .run(title, content, id);

  // changes: 更新件数。runの実行結果に入っている。0件=idに誤りがある
  if (result.changes === 0) {
    return res.status(404).json({
      message: "レコードが見つかりません",
    });
  }

  // idに一致するレコードを1件取得
  const updateNote = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);

  // 取得した
  res.json(updateNote);
});

/**
 * 削除処理
 * curl -i -X DELETE http://localhost:3000/notes/1
 * （-i: httpヘッダー見れる）
 */
app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);

  // テーブルから指定したidのレコードを削除
  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "レコードが見つかりません",
    });
  }

  // 204 No Content: 処理は成功したけど、返す本文はない
  // send: 本文なしのレスポンスを返して終了。res.status(204);とするとレスポンスを返し終わっていない。
  res.status(204).send();
});
