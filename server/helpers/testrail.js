Testrail = require('testrail-api');
var testrail_resp = '';

var testrail = new Testrail({
  host: 'https://bbcpodtest.testrail.com',
  user: 'vishal.swarnkar.ext@bbc.co.uk' || Process.env.TESTRAILUSER,
  password: 'RV1O5pOmApCJXb7Bj/M8-RVbXUDZcSneM4aph5A44' || Process.env.TESTRAILPASSWORD
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
