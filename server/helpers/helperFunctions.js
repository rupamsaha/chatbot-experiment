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
      if(contents[file.replaceAll('\n','')] != undefined){
        testCaseIds.push(contents[file.replaceAll('\n','')])
      }
    })
  callback(unique([].concat.apply([], testCaseIds)))
  });
}

function getCaseIds() {
  return JSON.parse(fs.readFileSync(path.join(__dirname + "/../../source/caseIds.json")))
}

String.prototype.replaceAll= function(str1, str2, ignore){
 return this.replace(new RegExp(str1.replace(/([\/\n\`\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

module.exports = {
  getTestCaseIdsFromMappingFile: getTestCaseIdsFromMappingFile,
  getCaseIds: getCaseIds
}
