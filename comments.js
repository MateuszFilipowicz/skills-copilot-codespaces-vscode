// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var ROOT_DIR = "html/";
var MongoClient = require('mongodb').MongoClient;
var db;

MongoClient.connect("mongodb://localhost/comments", function(err, database) {
    if(err) throw err;

    db = database;
});

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);
    console.log("URL path "+urlObj.pathname);

    if(urlObj.pathname.indexOf("comment") !=-1) {
        console.log("comment detected");
        if(req.method === "POST") {
            console.log("POST comment detected");
            req.on('data', function(chunk) {
                console.log("Received body data:");
                console.log(chunk.toString());
                var newComment = JSON.parse(chunk);
                console.log(newComment);
                db.collection("comments").insert(newComment, function(err, records) {
                    if(err) throw err;
                    console.log("Record added as "+records[0]._id);
                    res.writeHead(200);
                    res.end("");
                });
            });
        }
        else if(req.method === "GET") {
            console.log("GET comment detected");
            db.collection("comments", function(err, comments) {
                if(err) throw err;
                comments.find(function(err, items) {
                    items.toArray(function(err, itemArr) {
                        console.log("Document Array: ");
                        console.log(itemArr);
                        res.writeHead(200);
                        res.end(JSON.stringify(itemArr));
                    });
                });
            });
        }
    }
    else {
        fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
    }
}).listen(8080);
console.log('Server running at http://
