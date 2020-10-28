const fs = require('fs');

const writeToFile = (text) => {
  let filePate = './temp/try4.html';
  if (fs.existsSync(filePate)) {
    fs.unlinkSync(filePate);
  }
  fs.writeFileSync('./temp/try4.html', text, { 'flag': 'a' });
}

module.exports = { writeToFile };
