var http = require("http");
var fs = require("fs");
var path = require("path");
var port = 8080;
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

http
  .createServer(function (request, response) {
    console.log("request ", request.url);

    var filePath = "." + request.url;
    if (filePath == "./") {
      filePath = "./app/index.html";
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".wav": "audio/wav",
      ".mp4": "video/mp4",
      ".woff": "application/font-woff",
      ".ttf": "application/font-ttf",
      ".eot": "application/vnd.ms-fontobject",
      ".otf": "application/font-otf",
      ".wasm": "application/wasm",
    };

    var contentType = mimeTypes[extname] || "application/octet-stream";

    app.get("/", function (req, res) {
      const key = req.originalUrl || req.url;
      const cachedData = myCache.get(key);
      if (cachedData) {
        console.log("Data retrieved from cache");
        res.send(cachedData);
      } else {
        console.log("Data retrieved from API");
        getDataFromAPI(function (data) {
          myCache.set(key, data);
          res.send(data);
        });
      }
    });

    fs.readFile(filePath, function (error, content) {
      if (error) {
        if (error.code == "ENOENT") {
          fs.readFile("./404.html", function (error, content) {
            response.writeHead(404, { "Content-Type": "text/html" });
            response.end(content, "utf-8");
          });
        } else {
          response.writeHead(500);
          response.end(
            "Sorry, check with the site admin for error: " +
              error.code +
              " ..\n"
          );
        }
      } else {
        response.writeHead(200, { "Content-Type": contentType });
        response.end(content, "utf-8");
      }
    });
  })
  .listen(port);

console.log("Server running at http://127.0.0.1:" + port);
