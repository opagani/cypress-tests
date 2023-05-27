const glob = require("glob");
const fs = require('fs');

var getDirectories = function (src, callback) {
  glob(src + '/**/*', { nodir: true }, callback);
};
getDirectories('cypress/integration', function (err, res) {
  if (err) {
    console.log('Error', err);
  } else {
    const sortedFiles = res.sort((a, b) => a.split('/').length - b.split('/').length);
    console.log(sortedFiles);
    fs.writeFile(
        './src/data/cypressFiles.json',
        JSON.stringify(sortedFiles),
        function (err) {
            if (err) {
                console.error('Crap happens');
            }
        }
    );
  }
});