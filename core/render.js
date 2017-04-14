const fs    = require('fs');
const path  = require('path');

const viewPath  = path.join( __dirname,  ".." , "views" );
const _strCache = new Map();

function render(fileName) {
    return new Promise( (resolve,reject) => {
        if(_strCache.has(fileName)) {
            resolve(_strCache.get(fileName));
        }
        else {
            const finalPath = path.join( viewPath, fileName+'.html' ); 
            fs.readFile( finalPath , (err,data) => {
                if(err) reject(err);
                const _str = data.toString();
                //_strCache.set(fileName,_str)
                resolve(_str);
            });
        }
    });
}

module.exports = render;
