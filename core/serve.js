const fs    = require('fs');
const path  = require('path');

const mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "txt": "text/plain",
    "json": "application/json"
};

const serve = function(request,response) {
    return new Promise( (resolve,reject) => {
        const url = request.url;
        const url_extension = path.extname(url);
        if(url_extension !== '' || url.includes('.')) { 
            const filePath = path.join( __dirname, ".." , 'static' , url );
            fs.stat( filePath , (err,stats) => {
                if(err || !stats.isFile()) {
                    console.log('The file does not exist!');
                    response.statusCode = 404;
                    response.end('The file does not exist!');
                    reject();
                    return;
                }

                const mimeType = mimeTypes[path.extname(filePath).split(".").pop()];
                const RStream = fs.createReadStream( filePath );

                RStream.on('open',_=>{
                    response.writeHead(200,{
                        'Content-Type': mimeType,
                        'Content-Length': stats.size
                    });
                    RStream.pipe(response); 
                });

                RStream.on('error', (err) => { 
                    response.statusCode = 500;
                    response.end('Internal server error');
                    reject();
                });

                RStream.on('end', () => {
                    response.end();
                    resolve();
                });
            });
        }
        else {
            reject();
        }
    });
}

module.exports = serve;
