Testrail = require('testrail-api');
var testrail_resp = '';

var testrail = new Testrail({
  host: 'https://bbcpodtest.testrail.com',
  user: process.env.TESTRAILUSER,
  password: process.env.TESTRAILPASSWORD
});

function addRunInTestRail(projectID, options, callback){
  testrail.addRun(projectID, options, function (err, run) {
    if(err){
      callback(err);
    }
    callback(run);
  });
}

function addPlanInTestRail(projectID, options, callback) {
  testrail.addPlan(projectID, options, function (err, plan) {
    if(err){
      callback(err);
    }
    callback(plan);
  });
}

function addPlanEntryToTestPlan(projectID, suite_id, config_ids, case_ids, callback) {
  var options = optionsForPlanEntry(suite_id, config_ids, case_ids)
  console.log(`Options to generate test plan ${JSON.stringify(options)}`);

  addPlanInTestRail(projectID, {"name":"Bot test plan"}, (plan_id)=>{
    console.log(`Plan Id is generated :: ${plan_id.id}`);
    testrail.addPlanEntry(plan_id.id, options, (err, plan_entry)=>{
      if(err){
        callback(err);
      }
      callback(plan_id, plan_entry);
    });
  });
}

function optionsForPlanEntry(suite_id, config_ids, case_ids) {

  var devices = (config_ids.length > 0)? config_ids.split(',').map(Number):[]
  var options = {"name": "Bot test plan", "include_all": true}
  options["suite_id"] = suite_id
  options["config_ids"] = devices
  var arrRuns = [];
  if(devices.length > 0) {
    devices.map((ids)=>{
      var mapRuns = {}
      mapRuns["include_all"] = false
      mapRuns["case_ids"] = case_ids.map(Number)
      mapRuns["config_ids"] = [ids]
      arrRuns.push(mapRuns)
    })
  }else {
    var mapRuns = {}
    mapRuns["include_all"] = false
    mapRuns["case_ids"] = case_ids.map(Number)
    mapRuns["config_ids"] = devices
    arrRuns.push(mapRuns)
  }

  options["runs"] = arrRuns;

  return options;
}

function getAllDevicesFromTestRail(projectID, group_id, callback) {
    testrail.getConfigs(projectID, function (err, configs) {
      if(err){
        callback(err);
      }
      var c = configs.map((devices)=>{return devices.configs;});
      var arrDevices = [];
      c.reduce(function(a, b){return a.concat(b)},[]).forEach((device)=>{
        if(device.group_id == group_id)
        arrDevices.push("*"+device.id+"*::"+device.name+"\n");
      })
      callback(arrDevices);
  });
}

module.exports = {
  addRunInTestRail: addRunInTestRail,
  Obj: testrail,
  getAllDevicesFromTestRail: getAllDevicesFromTestRail,
  optionsForPlanEntry: optionsForPlanEntry,
  addPlanEntryToTestPlan: addPlanEntryToTestPlan,
  addPlanInTestRail: addPlanInTestRail
}
