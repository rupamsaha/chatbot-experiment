/*

At present its hard coded for testrail project id 161, which can be configured

There are two steps to get the formatted minimum timeStamp of test execution
1. getTestExecutionTime: $node executionTime.js requires value in the range of 0 - 11 which will fetch
execution results from that specific month from testrail
2. getMatrix: $node executionTime.js create simplified version of the json file which will be input for the
chat bot
*/


var testrail = require('./testrail'),
    fs = require('fs'),
    path = require('path'),
    rawExecutionResults='../../source/testrailExecutionResults.json',
    formattedExecutionResults='../../source/formattedExecResults.json',
    projectId = 191; //currently hard code

var executionTime = (function (){

// method to flatten nested array
const flattenArray = (arr) => [].concat.apply([], arr)

// get the current month from the system
function getCurrentMonth() {
  var timeStamp = new Date(Math.round(new Date().getTime()/1000.0)*1000);
  return timeStamp.getMonth()+'-'+timeStamp.getFullYear();
}

// convert unix time to human readable timeStamp
function convertUnixTimeToHumanReadable(epochtime){
  var readabletime = new Date(epochtime * 1000);
  return readabletime.getMonth()+'-'+readabletime.getFullYear();
}

// query the testrail api to fetch project test case execution
function getTestExecutionTime(month_year) {
  testrail.Obj.getPlans(projectId).then((plans)=>{
      var plan = plans.filter((plan)=>{
        if(convertUnixTimeToHumanReadable(plan.created_on) == `${month_year}` &&
          plan.name.indexOf('Regression') != -1){
            return true;
          }
      });
      return plan;
  }).then(getTestRuns)
  .then((arrTestRuns) => {
    return appendJsonData(arrTestRuns, rawExecutionResults);
  }).catch((err)=>{
    console.error("Error " + err.stack);
  });
}

// get test results from each test plans
function getTestRuns(plans) {
  var planFetches = plans.map((plan) => {
    return testrail.Obj.getPlan(plan.id).then((plan_ids) => {
      return Promise.all(plan_ids.entries.map((entries)=>{
          var testExecutionResults = entries.runs.map((runs)=>{
            return testrail.Obj.getRun(runs.id).then((testpacks) => {
                return testrail.Obj.getTests(testpacks.id).then((testcases)=>{
                    return Promise.all(testcases.map((testresult)=>{
                      return testrail.Obj.getResults(testresult.id).then((results)=>{
                        if(results.length>0)
                       return results;
                    }).catch((err)=>{
                      console.log(`Unhandled error on fetching test results:: ${plan.name} ${err.message}`)
                    })
                  })).then(flattenArray).catch((err)=>{
                    console.log(`Unhandled error in resolving all the results ${err}`)
                  })
                }).catch((err)=>{
                  console.log(`Unhandled error in fetching all the testcases ${err.message}`)
                })
              }).catch((err)=>{
                console.log(`Unhandled error in fetching all the testpacks ${err}`)
              })
            })
          return Promise.all(testExecutionResults).catch((err)=>{
            console.log(`Unhandled error in fetching test runs ${err}`)
          });
      })).then(flattenArray).catch((err)=>{
        console.log(`Unhandled error ${err}`)
      })
    }).catch((err)=>{
      console.log(`Unhandled error ${err}`)
    })
  })

  return Promise.all(planFetches).catch((err) => {
    console.log(`Unhandle error ${err}`);
  })

}

// write the json response in json file
function writeJson(jsonData, filePath) {
  fs.appendFileSync(filePath, JSON.stringify(jsonData, null, 2), function (err) {
        if (err) throw err
        console.log('Saved file')
  })
}

// function to check if the json object is empty
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

// append the json with multiple entries
function appendJsonData(jsonObj, filePath) {
  if(!fs.existsSync(filePath)){
    console.log("Hello");
    fs.writeFileSync(filePath, JSON.stringify(jsonObj))
  }else{
    var json = JSON.parse(fs.readFileSync(filePath));
    json.push(jsonObj);
    fs.writeFileSync(filePath, JSON.stringify(jsonObj))
  }
}

//function to get max outof an array
function totalOfAllResources(arr) {
  return arr.reduce(function(a, b) { return a+b; });
}


function getMatrix() {
  var testMaps= {};
  var testPacks = [];

  var content = JSON.parse(fs.readFileSync(rawExecutionResults));
  testMaps['Total-Regression'] = content.length;

  if (content.length > 0){
    content.forEach((pack, index)=>{
      var innerMaps = {};
      var execution = [];
      var TotalResourceCount = [];
      var resourceAvgCount = [];

      innerMaps[`TotalDevices`] = pack.length

      pack.forEach((testcases, arrIndex)=>{
        if (testcases[0] == null) return;
        var executionMaps = {};
        executionMaps[`TotalTestcases`] = getTestcasesCount(testcases);
        executionMaps[`Min-Time`] = maxAndMinTime(testcases).reduce(function(a, b) { return Math.min(a, b); });
        executionMaps[`Max-Time`] = maxAndMinTime(testcases).reduce(function(a, b) { return Math.max(a, b); });
        execution.push(executionMaps);
        if(testcases != null)
        executionMaps[`TotalResourceCount`] = getResourceCount(testcases);
        resourceAvgCount.push(getResourceCount(testcases).length);
      })

      innerMaps['MaxResourceCount'] = totalOfAllResources(resourceAvgCount);
      innerMaps['Execution']=execution;
      testPacks.push(innerMaps);
    })

  }else {
    console.log("There is nothing to calculate");
  }
  testMaps['TestPacks'] = testPacks

  console.log(JSON.stringify(testMaps));
  // writeJson(testMaps, formattedExecutionResults);
}

function getTestcasesCount(testcases) {
  var testIds = {};
  testcases.map((testcase)=>{
    if(testcase == null) return;
    testIds[testcase.test_id] = 1
  })
  return Object.keys(testIds).length;
}

function maxAndMinTime(rawjson) {
  var arrayTimeStamp = [];
    rawjson.forEach((execution)=>{
      if(execution == null) return;
      arrayTimeStamp.push(execution.created_on);
    })
  return arrayTimeStamp;
}

function getResourceCount(testcases) {
  var createdBy = {};
  testcases.map((testpack)=>{
    if (testpack != null)
    createdBy[testpack.created_by]=1;
  })
  return Object.keys(createdBy);
}

return {
  getTestExecutionTime: getTestExecutionTime,
  getMatrix: getMatrix
}

})();

// executionTime.getTestExecutionTime(process.argv.slice(2));
// executionTime.getMatrix();
