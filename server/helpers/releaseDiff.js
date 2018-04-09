const { exec }     = require('child_process');
var process        = require('process');
const REPO_PATH    = "path/to/tap-static/cloned/repo";

function releaseDiff(repo_path ,oldRelease, newRelease, callback){
    process.chdir(repo_path)
    exec("git pull && git diff --numstat --pretty=format:%s " + oldRelease +" " + newRelease, (err, stdout, stderr) => {
    
    if (err) {
       console.error(`exec error: ${err}`);
       return;
    }

    var fileArray = []

    stdout.split("\n").forEach(function(fileString){
       fileArray.push(fileString.split("\t")[2])
    });

    callback(fileArray.filter(Boolean));
   });
}
