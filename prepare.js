const path = require('path'),
  fs = require('fs-extra');

const rootPath = path.normalize(__dirname);
const DIST_FOLDER = path.join(rootPath, 'dist');

const copy = function() {
    fs.copySync(path.join(rootPath, 'src/electron.js'), path.join(DIST_FOLDER, 'electron.js'));
};

copy();

