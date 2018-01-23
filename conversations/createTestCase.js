let start_end_date
var path = require('path');
var fs = require('fs');
var log_details = require('../server/helpers/gitlog');
var testrail = require('../server/helpers/testrail');
var testCaseIds = require('../server/helpers/helperFunctions')
var repo = path.join(__dirname,"/../source/bbcthree-web");
let mappingFilePath = path.join(__dirname + '/../source/mapping.json')
var test_run_options = { "name": "Test pack for regression by BOT", "include_all": false, "suite_id": 5330 }
var run_id = ''
const projectId = '191'

exports.createTestCase = (bot, message) => {
  bot.createConversation(message, function(err, convo) {
    convo.addMessage({
          text: 'Sure!',
          action: 'start_end_date_thread',
        },'yes_thread');

    // create a path for when a user says NO
    convo.addMessage({
        text: 'You said no, that is too bad. Is there any thing else I can do for you !!',
    },'no_thread');

    convo.addMessage({
        text: 'Ohh! Try Again',
        action: 'start_date_thread',
    },'no_response');

    convo.addMessage({
        text: 'Sorry I did not understand.',
        action: 'default',
    },'bad_response');

    convo.addMessage({
        text: 'Testpack created! https://bbcpodtest.testrail.com/index.php?/runs/overview/191'
    }, 'test-pack-ready')

    convo.addQuestion({text: "Please tell me the date range of the changes done in Code base in this format YYYY-MM-DD,YYYY-MM-DD?",
     quick_replies: [{content_type: "text"}]
    }, (res, convo)=>{
     convo.setVar('start_end_date', res.text);
     start_end_date = res.text
     convo.gotoThread('confirmation_thread');
   },{key: "start_end_date"}, 'start_end_date_thread');

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

    convo.addQuestion(`Kindly confirm your response? Start and End Date: *{{vars.start_end_date}}*`, [
      {
          pattern: 'yes',
          callback: function(response, convo) {
              var duration = start_end_date.toString().split(',')
              var options = {repo: repo, since: duration[0] , before: duration[1]}

              log_details.getUpdatedFilesFromGitLog(options, (gitfiles) => {
                testCaseIds.getTestCaseIdsFromMappingFile(gitfiles, mappingFilePath, (caseIds) =>{
                   fs.writeFileSync(path.join(__dirname + '/../source/caseIds.json'),
                   JSON.stringify(caseIds.map((x)=>{return x.replace('C', '');})));
                })
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

    convo.addQuestion(`Total test run scenarios :: *${JSON.parse(fs.readFileSync(path.join(__dirname + "/../source/caseIds.json"))).length}*. Would you like me to create test pack in Testrail?`, [
        {
            pattern: 'yes',
            callback: function(response, convo) {
              caseIds = JSON.parse(fs.readFileSync(path.join(__dirname + '/../source/caseIds.json')));
              test_run_options['case_ids'] = caseIds;
              testrail.addRunInTestRail(projectId, test_run_options, (callback)=>{
                if(Object.keys(callback).indexOf('id')==0){
                  bot.reply(message,`Testpack created! https://bbcpodtest.testrail.com/index.php?/runs/overview/191 RUN ID :: ${callback.id}`);
                }

                if(callback != undefined && Object.keys(callback).indexOf('error')==0) {
                  bot.reply(message,`Error in creating Test pack, please retry :: ${callback.error}`);
                }

              });
              // convo.gotoThread('test-pack-ready');
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

    convo.on('end', function(convo) {
       if (convo.status == 'completed') {
         bot.reply(message,`Thank you. Happy to serve you.`)
       } else {
         bot.reply(message,'Sorry about that, what else can I do for you?')
       }
    })

    convo.activate();
  })
}
