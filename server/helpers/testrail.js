Testrail = require('testrail-api');
var testrail_resp = '';

var testrail = new Testrail({
  host: 'https://bbcpodtest.testrail.com',
  user: username || Process.env.TESTRAILUSER,
  password: password || Process.env.TESTRAILPASSWORD
});

function addRunInTestRail(projectID, options, callback){
  testrail.addRun(projectID, options, function (err, run) {
    if(err){
      callback(err);
    }
    callback(run);
  });
}

module.exports = {
  addRunInTestRail: addRunInTestRail,
  Obj: testrail
}
