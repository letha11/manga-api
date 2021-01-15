const express = require("express");
const manga = require("./routes/manga");

const app = express();
const port = 3000;

app.use("/api", manga);

app.use("/", (req, res) => {
  res.send({
    message: "see documentation here https://github.com/letha11/manga-api",
    find_me: {
      facebook: "https://www.facebook.com/ibka.anhar.1",
      instagram: "https://www.instagram.com/ibkaanharfatcha/",
      github: "https://github.com/letha11",
    },
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
