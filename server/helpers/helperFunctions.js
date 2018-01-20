var fs = require('fs');
var unique = require('array-unique');

function getTestCaseIdsFromMappingFile(updatedFiles, mappingFilePath, callback){
  var testCaseIds = []
  fs.readFile(mappingFilePath, 'utf8', function(err, contents) {
    contents = JSON.parse(contents)
    updatedFiles.forEach(function(file){
      if(contents[file] != undefined){
        testCaseIds.push(contents[file])
      }
    })
  callback(unique([].concat.apply([], testCaseIds)))
  });
}

module.exports = {
  getTestCaseIdsFromMappingFile: getTestCaseIdsFromMappingFile
}
