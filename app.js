var   express = require("express"),
      app     = express(),
      request = require('request'),
      path    = require("path");
var Crawler = require("./crawler");

app.use(express.static('public'));

app.get("/", function(req, res){
    
   if(!req.query.define){
       res.sendFile(path.join(__dirname+'/views//index.html'));
   }  else {
        if(encodeURIComponent(req.query.define).includes("%")){
                 console.log("yes");
                 res.header("Access-Control-Allow-Origin", "*");
                 return res.status(404).sendFile(path.join(__dirname+'/views/404.html'));
        }
        
        var url = 'https://en.oxforddictionaries.com/search?filter=noad&query=' + req.query.define;
        url = encodeURI(url);

        request({
        method: 'GET',
        url: url,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:58.0) Gecko/20100101 Firefox/58.0"
        }
    }, function(err, response, body) {
        
            if(err){
                return console.error(err);
            }
            let crawler = new Crawler(body);
            let dictionary = crawler.crawl();
            Object.keys(dictionary).forEach(key => {(Array.isArray(dictionary[key]) && !dictionary[key].length) && delete dictionary[key]});
            
            res.header("Content-Type",'application/json');
            res.header("Access-Control-Allow-Origin", "*");
            res.send(JSON.stringify(dictionary, null, 4));
            
        });
    }
});


app.listen(3000, process.env.IP, function(){
    console.log("I am listening...");
});
