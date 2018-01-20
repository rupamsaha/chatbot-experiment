Testrail = require('testrail-api');

var testrail = new Testrail({
  host: 'https://bbcpodtest.testrail.com',
  user: username || Process.env.TESTRAILUSER,
  password: password || Process.env.TESTRAILPASSWORD
});

function addRunInTestRail (projectID, options) {
  testrail.addRun(projectID, options, function (err, run) {
    if(err){
      console.log(err)
    }
    return run
  });
}

module.exports = {
  addRunInTestRail: addRunInTestRail,
  testrail: testrail
}
