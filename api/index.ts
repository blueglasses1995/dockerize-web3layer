import express, { Application, Request, Response } from "express";
import cors from "cors";
import { uid } from "uid";
import mysql from "mysql2";
import {config} from "dotenv";
config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
const app: Application = express();

app.use(cors({ origin: `http://${process.env.WEB_HOST}:${process.env.WEB_PORT}` }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  console.log("getリクエストを受け付けました。");
  const sql = "SELECT * FROM todo";
  connection.query(sql, (error, result) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json({ todos: result });
    }
  });
});

app.post("/add", (req: Request, res: Response) => {
  console.log("postリクエストを受け付けました。");
  const { todo } = req.body.data;
  const uidValue = uid();
  const sql = `INSERT INTO todo VALUES ("${uidValue}", "${todo}")`;
  connection.query(sql, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: "Failed to add todo" });
    }
    return res.status(200).json({ id: uidValue, todo });
  })
});


app.delete("/delete", (req: Request, res: Response) => {
  console.log("deleteリクエストを受け付けました。");
  console.log(req.body.id);
  const id = req.body.id;
  const sql = `DELETE FROM todo WHERE id = "${id}"`;
  connection.query(sql, (error) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json({ message: "success" });
    }
  });
});

app.put("/update", (req: Request, res: Response) => {
  console.log("putリクエストを受け付けました。");
  console.log(req.body.data);
  const { id, todo } = req.body.data;
  const sql = `UPDATE todo SET todo="${todo}" WHERE id="${id}"`
  connection.query(sql, (error) => {
    if (error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(200).json({ id, todo });
    }
  });
});

try {
  app.listen(process.env.NODE_PORT, () => {
    console.log(`server running at://localhost:${process.env.NODE_PORT}`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
