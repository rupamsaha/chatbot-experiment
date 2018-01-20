let heading
let steps
let start_date
let end_date
var path = require('path');
var log_details = require('../server/helpers/gitlog');
var testrail = require('../server/helpers/testrail');
var repo = path.join(__dirname,"../source/bbcthree-web");

exports.createTestCase = (bot, message) => {
  bot.createConversation(message, function(err, convo) {
    convo.addMessage({
          text: 'Sure!',
          action: 'start_date_thread',
        },'yes_thread');

    convo.addMessage({
        text: 'Ohh! Try Again',
        action: 'deviceCount_thread',
    },'no_response');

    convo.addMessage({
        text: 'Sorry I did not understand.',
        action: 'default',
    },'bad_response');

    convo.addMessage({
        text: 'Testpack created! RUN ID : {{vars.run_id}}'
    }, 'test-pack-ready')

    convo.addQuestion({text: "Please tell me the start date of the changes in YYYY-MM-DD format?",
     quick_replies: [{content_type: "start_date"}]
    }, (res, convo)=>{
     convo.setVar('start_date', res.text);
     convo.gotoThread('end_date_thread');
   },{key: "start_date"}, 'start_date_thread');

   convo.addQuestion({text: "Please tell me the end date of the changes in YYYY-MM-DD format?",
    quick_replies: [{content_type: "end_date"}]
    }, (res, convo)=>{
    convo.setVar('end_date', res.text);
    convo.gotoThread('confirmation_thread');
  },{key: "end_date"}, 'end_date_thread');

    convo.addQuestion('Do you want to write the test pack based on the changes in Codebase?', [
        {
            pattern: 'yes',
            callback: function(response, convo) {
                convo.gotoThread('yes_thread');
            },
        },
        {
            pattern: 'no',
            callback: function(response, convo) {
                convo.gotoThread('no_thread');
            },
        },
        {
            pattern: 'shutdown',
            callback: function(response, convo) {
                convo.gotoThread('shutdown');
            },
        },
        {
            default: true,
            callback: function(response, convo) {
                convo.gotoThread('bad_response');
            },
        }
    ],{},'default');

    convo.addQuestion(`Kindly confirm your response? Start Date: *{{vars.start_date}}* End Date: *{{vars.end_date}}*`, [
      {
          pattern: 'yes',
          callback: function(response, convo) {
              var options = {repo: repo, since: start_date , before: end_date}
              log_details.getUpdatedFilesFromGitLog(options, (gitfiles) => {
                bot.reply(message,`${gitfiles}`);
              })
              convo.gotoThread('create_test_pack');
          },
      },
      {
          pattern: 'no',
          callback: function(response, convo) {
              convo.gotoThread('no_response');
          },
      },
      {
          default: true,
          callback: function(response, convo) {
              convo.gotoThread('bad_response');
          },
      }
    ], {}, 'confirmation_thread')

    convo.addQuestion('Would you like me to create test pack in Testrail?', [
        {
            pattern: 'yes',
            callback: function(response, convo) {
              var options = { "name": "This is a new test run", "case_ids": ['1065399', '1065401'], "include_all": false, "suite_id": 6311 }
              testrail.addRunInTestRail('191', options, (testrun_id)=>{
                convo.setVar('run_id', res.text);
                bot.reply(message,`${testrun_id}`);
              })
              convo.gotoThread('test-pack-ready');
            },
        },
        {
            pattern: 'no',
            callback: function(response, convo) {
                convo.gotoThread('no_thread');
            },
        },
        {
            default: true,
            callback: function(response, convo) {
                convo.gotoThread('bad_response');
            },
        }
    ],{},'create_test_pack');

    convo.activate();
  })
}
