const os = require("os");
const fs = require("fs");

const outputCode = (code) => {
  fs.open("./public/codes.txt", "a", 666, function (e, id) {
    fs.write(id, code.trim() + os.EOL, null, "utf8", function () {
      fs.close(id, function () {
        console.log("file is updated");
      });
    });
  });
};

module.exports = outputCode;
