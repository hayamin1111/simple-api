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
 * データをテーブルに保存しJSONとして返す
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

// 更新処理
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

  if (result.changes === 0) {
    return res.status(404).json({
      message: "noteが見つかりません",
    });
  }

  const updateNote = db.prepare("SELECT * FROM notes WHERE id = ?").get(id);

  res.json(updateNote);
});
