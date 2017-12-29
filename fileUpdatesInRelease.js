var github = require('octonode');
var request = require('request');
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'

var client = github.client();

var client = github.client(AUTH_TOKEN);
var ghrepo = client.repo('USER/REPO');

callback = function(err, data, headers) {

  var latest_tag = data[0]['tag_name']
  
  ghrepo.tags(function(err, data, headers){

    data.forEach(function(d){
      if(d['name'] == latest_tag){
        var options = {
          url: d['commit']['url'],
          headers: {
            'User-Agent': 'request'
          },
          auth: {
            'bearer': AUTH_TOKEN
          }
        }

        request(options, function callback(error, response, body) {
          if(error){
            console.log("Error" + error)
          }

          var filesUpdated = []

          if (!error && response.statusCode == 200) {
            output = JSON.parse(body)
 
            Object.keys(output["files"]).map(function(objectKey, index) {
              var dataObj = new Object();
              dataObj = {
               "filename": output["files"][objectKey]["filename"],
               "additions": output["files"][objectKey]["additions"],
               "deletions": output["files"][objectKey]["deletions"],
               "changes":  output["files"][objectKey]["changes"],
              }
              filesUpdated.push(dataObj);
            });

            filesUpdated.forEach(function(entry) {
              console.log(entry);
            });
          }
        })
      }
    });

  });
  
  if(err){
    console.log(err)
  }

};

ghrepo.releases(callback);


