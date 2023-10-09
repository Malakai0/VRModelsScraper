import express from "express";
import alexa from "../database/alexa.js";

const app = express();
app.use(express.json());
app.use(express.static("src/mod/api/public"));

const port = 3000;

const endpoints = [
  "avatars",
  "accessories",
  "animations",
  "clothing",
  "materials",
  "scripts",
  "shaders",
  "worlds",
];

for (const endpoint of endpoints) {
  app.get(`/api/v1/${endpoint}`, (req, res) => {
    return alexa.genericFilter(req, res, endpoint);
  });
}

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

export default () => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};
