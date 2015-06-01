var _http = require('http');
var _querystring = require('querystring');
var _fs = require('fs');
var _listeningPort = GetPort(process.argv);
var _path = require('path');
var _mime = require('mime');
function GetPort(cla) {
    if(cla.length != 3) {
        console.log("port not specified");
        process.exit();
    } else {
        var tempPort = parseInt(cla[2]);
        console.log("port : " + tempPort + " extracted");
        return tempPort;
    }
}
_http.createServer(function(request, response) {
    var responseContentType, staticFileRequested;
    var requestedFilePath = request.url;
    var processStaticFileRequest = false;
    console.log("requestedFilePath : " + requestedFilePath);
    var fileExtentionName = _path.extname(requestedFilePath);
    console.log("fileExtensionName : " + fileExtentionName);
    if(requestedFilePath !== '/' && fileExtentionName === '') {
        console.log("not a static file request");
        if(request.url == '/hfusppu') {
            if(request.method == 'POST') {
                console.log("POST request");
                Authenticate(request, response, function(auth_res) {
                    if(auth_res) {
                        console.log("authenticated");
                    } else {
                        console.log("invalid input");
                    }
                });
            }
        }
    } else {
        if(requestedFilePath === '/') {
            console.log("");
            staticFileRequested = '../index.html';
            fileExtentionName = '.html';
            processStaticFileRequest = true;
        }
        else {
            staticFileRequested = '..'.concat(requestedFilePath);
            processStaticFileRequest = true;
        }
    }
    if(processStaticFileRequest) {
        console.log("processing request for static file");
        responseContentType = _mime.lookup(fileExtentionName);
        console.log("content type of static request : " + responseContentType);
        if(fileExtentionName === '.css' || fileExtentionName === '.js' || fileExtentionName === '.html') {
            console.log("requested static file type : html or css or js");
            _fs.readFile(staticFileRequested, function(err, data) {
                if(err) {
                    throw err;
                    processStaticFileRequest = false;
                    console.log("error in extracting requested static file");
                }
                if(processStaticFileRequest) {
                    console.log("static file " + staticFileRequested + " extracted");
                    response.writeHeader(200, {"Content-Type" : responseContentType});
                    response.write(data);
                    response.end();
                } else {
                    response.writeHeader(400, "error in processing static file requested", {"Content-Type" : "text/plain"});
                    response.end();
                }
            });
        } else if(fileExtentionName === '.jpg' || fileExtentionName === '.jpeg' || fileExtentionName === '.png') {
            console.log("requested static file type : image");
            _fs.readFile(staticFileRequested, function(err, data) {
                if(err) {
                    throw err;
                    processStaticFileRequest = false;
                    console.log("error in extracting requested static file");
                }
                if(processStaticFileRequest) {
                    console.log("static file " + staticFileRequested + " extracted");
                    response.writeHeader(200, {"Content-Type" : responseContentType});
                    response.end(data, 'binary');
                } else {
                    response.writeHeader(400, "error in processing static file requested", {"Content-Type" : "text/plain"});
                    response.end();
                }
            });
        } else {
            response.writeHeader(400, "static file type not supported", {"Content-Type" : "text/plain"});
            response.end();
        }
    }
}).listen(9123, function () {
    console.log("started listening on port " + _listeningPort);
});
function Authenticate(request, response, callback) {
    var auth_res, query_data = "";
    if(typeof callback != 'function') {
        return null;
    }
    request.on('data', function(data) {
        query_data += data;
        if(query_data.length > 1e6) {
            query_data = "";
            response.writeHead('413', {'Content-Type' : 'text/plain'});
            response.writeHead("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            response.writeHead("Access-Control-Allow-Origin" , "POST");
            response.end();
            request.connection.destroy();
            callback(false);
        } else {
            callback(true);
        }
    });
};