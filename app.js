var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {
    var filePath = '.' + request.url;
    if (filePath == './'){
      filePath = './index.html';
    }
    else if (filePath == './about'){
      filePath = './about.html';
    }
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.mp4':
            contentType = 'video/mp4';
            break;
    }
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./error.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
              response.writeHead(500);
              response.end('500 - Internal error with a response code 500');
            }
        }
        else {
          if(extname == '.mp4'){
            var stat = fs.statSync(filePath);
            console.log(stat.size)
            var range = request.headers.range || "";
            var total = stat.size;
            if (range) {
              var parts = range.replace(/bytes=/, "").split("-");
              var partialstart = parts[0];
              var partialend = parts[1];
              var start = parseInt(partialstart, 10);
              var end = partialend ? parseInt(partialend, 10) : total;
              var chunksize = (end - start) + 1;
              headers = {
                "Content-Range": "bytes " + start + "-" + end + "/" + total,
                "Accept-Ranges": "bytes",
                "Content-Length": chunksize,
                "Content-Type": contentType
              };
              response.writeHead(200, headers);
              console.log(start + "-" + end + "/" + total)
            } else {
              headers = {
                "Accept-Ranges": "bytes",
                "Content-Length": stat.size,
                "Content-Type": contentType
              };
              response.writeHead(200, headers);
            }
            fs.createReadStream(filePath, {start:start, end:end}).pipe(response);
          } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
          }
        }
    });

}).listen(3000);
