var _http = require('http');
var _querystring = require('querystring');
var _fs = require('fs');
var _listeningPort = GetPort(process.argv);
var _path = require('path');
var _mime = require('mime');
function GetPort(cla) {
    if(cla.length != 3) {
        console.error("port not specified");
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
        console.log("static file not request");
        if(request.url == '/hfusppu') {
            if(request.method === 'POST') {
                console.log("POST request");
                Authenticate(request, response, function(auth_res) {
                    if(auth_res) {
                        console.log("authenticated");
                    } else {
                        console.error("invalid input");
                    }
                });
            }
        }
    } else {
        if(requestedFilePath === '/') {
            console.log("index file requested");
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
        console.log("processing request for static file : " + staticFileRequested);
        responseContentType = _mime.lookup(fileExtentionName);
        console.log(staticFileRequested + " :: content type of static request : " + responseContentType);
        if(fileExtentionName === '.css' || fileExtentionName === '.js' || fileExtentionName === '.html' || fileExtentionName === '.map') {
            console.log(staticFileRequested + " :: requested static file type : html or css or js or json");
            _fs.readFile(staticFileRequested, function(err, data) {
                if(err) {
                    throw err;
                    processStaticFileRequest = false;
                    console.error("error in extracting requested static file");
                }
                if(processStaticFileRequest) {
                    console.log("static file " + staticFileRequested + " extracted");
                    response.writeHeader(200, {"Content-Type" : responseContentType});
                    response.write(data);
                    response.end();
                } else {
                    console.warn("static file : " + staticFileRequested + " request was not successful");
                    response.writeHeader(400, "error in processing static file requested", {"Content-Type" : "text/plain"});
                    response.end();
                }
            });
        } else if(fileExtentionName === '.jpg' || fileExtentionName === '.jpeg' || fileExtentionName === '.png' || fileExtentionName === '.ico') {
            console.log(staticFileRequested + " :: requested static file type : image");
            _fs.readFile(staticFileRequested, function(err, data) {
                if(err) {
                    throw err;
                    processStaticFileRequest = false;
                    console.error("error in extracting requested static file");
                }
                if(processStaticFileRequest) {
                    console.log("static file " + staticFileRequested + " extracted");
                    response.writeHeader(200, {"Content-Type" : responseContentType});
                    response.end(data, 'binary');
                } else {
                    console.warn("static file : " + staticFileRequested + " request was not successful");
                    response.writeHeader(400, "error in processing static file requested", {"Content-Type" : "text/plain"});
                    response.end();
                }
            });
        } else {
            console.warn("static file : " + staticFileRequested + " request is not currently supported");
            response.writeHeader(400, "static file type not supported", {"Content-Type" : "text/plain"});
            response.end();
        }
    }
}).listen(_listeningPort, function () {
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
            response.writeHead(413, "data size limit exceeded!", {'Content-Type' : 'text/plain'});
            response.end();
            request.connection.destroy();
            callback(false);
        } else {
            response.writeHead(200, "OK authenticated!", {"Content-Type": "text/plain"});
            response.end(query_data);
            var jsondata = JSON.parse(query_data);
            console.log("user : " + jsondata.user);
            console.log("key : " + jsondata.key);
            callback(true);
        }
    });
};