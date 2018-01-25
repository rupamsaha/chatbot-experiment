const gitlog = require('gitlog');

function getUpdatedFilesFromGitLog(options, callback){
  var updatedFiles = []

  gitlog(options, function(error, commits) {
    commits.forEach(function(d){
       d['files'].forEach(function(file){
         if(file.includes('.js')){
           updatedFiles.push(file+"\n")
         }
       })
    })
    callback(updatedFiles)
  });

}

module.exports = {
  getUpdatedFilesFromGitLog: getUpdatedFilesFromGitLog
}
