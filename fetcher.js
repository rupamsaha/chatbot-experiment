// var fetch = require('promise-path').fetch
var request = require('request-promise');
var url = "https://bbcpodtest.testrail.com/index.php?/api/v2/get_plans/"
var apikey = 'your testrail apikey'
var username = 'your testrail email id'
var Testrail = require('testrail-api');

var testrail = new Testrail({
  host: 'https://bbcpodtest.testrail.com',
  user: username,
  password: apikey
});

module.exports = {
  testrail: testrail
}
