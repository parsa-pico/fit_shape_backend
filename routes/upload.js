const router = require("express").Router();
const fs = require("fs");
const busboy = require("busboy");
const path = require("path");

router.post("/", async (req, res) => {
  // const fileSize = req.headers["content-length"] / 1024; // in KB
  // if (fileSize >= 5000)
  // return res.status(400).send("file size should be at most 5MB");
  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: 10000 * 1024,
      fieldSize: 10000 * 1024,
      fieldNameSize: 1024 * 1024,
    },
  });
  bb.on("error", (err) => {
    console.log(err);
    return res.send(err);
  });
  bb.on("finish", () => {
    console.log("inside finish");
  });
  bb.on("close", () => {
    console.log("inside close");
    return res.send("ok");
  });

  bb.on("file", (name, file, info) => {
    console.log("before file.pipe");
    const saveTo = "uploads/" + info.filename;
    file.pipe(fs.createWriteStream(saveTo));
    console.log("after file.pipe");
  });
  // bb.on("filesLimit", () => {
  //   console.log("inside files limit");
  //   res.writeHead(413, { Connection: "close" });
  //   res.end();
  // });
  // bb.on("partsLimit", () => {
  //   console.log("inside parts limit");
  //   res.writeHead(413, { Connection: "close" });
  //   res.end();
  // });
  // bb.on("fieldsLimit", () => {
  //   console.log("inside field limit");
  //   res.writeHead(413, { Connection: "close" });
  //   res.end();
  // });
  // bb.on("field", (name, value, info) => {
  //   console.log("name:", name);
  //   console.log("value:", value);
  //   console.log("info:", info);
  // });
  req.pipe(bb);
  // return;
});

module.exports = router;
