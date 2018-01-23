var fs = require('fs');
var path = require('path');
var unique = require('array-unique');
let mappingFilePath = path.join(__dirname + '/../../source/mapping.json')
var caseIdsCollection = [];

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
