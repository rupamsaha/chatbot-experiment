let start_end_date
var path = require('path');
var fs = require('fs');
var log_details = require('../server/helpers/gitlog');
var testrail = require('../server/helpers/testrail');
var testCaseIds = require('../server/helpers/helperFunctions')
var repo = path.join(__dirname,"/../source/bbcthree-web");
let mappingFilePath = path.join(__dirname + '/../source/mapping.json')
const suite_id = 5330
const group_id = 320
var device_list = ''
var test_run_options = { "name": "Test pack for regression by BOT", "include_all": false, "suite_id": suite_id }
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
        text: 'You said no. Is there any thing else I can do for you !!',
    },'no_thread');

    convo.addMessage({
        text: 'Ohh! Try Again',
        action: 'start_end_date_thread',
    },'no_response');

    convo.addMessage({
        text: 'Sorry, I didnt get you',
        action: 'default',
    },'bad_response');

    convo.addQuestion({text: "Please tell me the date range of the changes done at Code base in format *Start Date:* YYYY-MM-DD, *End Date:* YYYY-MM-DD",
     quick_replies: [{content_type: "text"}]
      }, (res, convo)=>{
       convo.setVar('start_end_date', res.text);
       start_end_date = res.text
       convo.gotoThread('confirmation_thread');
     },{key: "start_end_date"}, 'start_end_date_thread');

   convo.addQuestion({text: "Please choose the devices by their Ids in comma separated (','), you want to add in test plan:",
    quick_replies: [{content_type: "text"}]
    }, (res, convo)=>{
      convo.setVar('device_list', res.text);
      console.log(`Device List :: ${res.text}`)
      device_list = res.text
      convo.gotoThread('create_test_plan_with_devices')
    },{key: "device_list"}, 'choose_devices');

    convo.addQuestion('Do you want to write the test plan based on the changes in Codebase?', [
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

    convo.addQuestion(`Kindly confirm your response? Start Date: End Date: *{{vars.start_end_date}}*`, [
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
                bot.reply(message, `*Total* ${testCaseIds.getCaseIds().length} *test cases get created for regression*`);
              })
              convo.gotoThread('get_device_list');
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

    convo.addQuestion('`Do you want to add the devices to the test plan?`', [
      {
          pattern: 'yes',
          callback: function(response, convo) {
              testrail.getAllDevicesFromTestRail(projectId, group_id, (devices)=>{
                bot.reply(message, `${devices}`);
              })
              convo.gotoThread('choose_devices');
          },
      },
      {
          pattern: 'no',
          callback: function(response, convo) {
              convo.gotoThread('create_test_plan_without_devices');
          },
      },
      {
          default: true,
          callback: function(response, convo) {
              convo.gotoThread('bad_response');
          },
      }
    ], {}, 'get_device_list')

    convo.addQuestion(`Total *${testCaseIds.getCaseIds().length}* test cases & Total Devices *{{vars.device_list}}* will get create for regression.\n *Would you like me to create test pack in Testrail?*`, [
        {
            pattern: 'yes',
            callback: function(response, convo) {
              testrail.addPlanEntryToTestPlan(projectId, suite_id, device_list, testCaseIds.getCaseIds(), (plan, planEntry) =>{
                console.log(plan);
                    if(planEntry != undefined && Object.keys(planEntry).indexOf('id')==0){
                      bot.reply(message,`Test Plan created! https://bbcpodtest.testrail.com/index.php?/runs/overview/${projectId} Plan ID :: ${plan.id}`);
                      convo.status = 'completed';
                    }else if (planEntry != undefined && Object.keys(planEntry).indexOf('error')==0) {
                      bot.reply(message,`Error in creating Test plan, please retry :: ${planEntry.error}`);
                      convo.gotoThread('no_response');
                    }else {
                      bot.reply(message,`Error in creating Test plan, please retry :: ${planEntry}`);
                      convo.gotoThread('no_response');
                    }
              })
            }
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
    ],{},'create_test_plan_with_devices');

    convo.addQuestion(`Total *${testCaseIds.getCaseIds().length}* test cases will get create for regression.\n *Would you like me to create test run in Testrail?*`, [
        {
            pattern: 'yes',
            callback: function(response, convo) {
               testrail.addPlanEntryToTestPlan(projectId, suite_id, device_list, testCaseIds.getCaseIds(), (plan, planEntry) =>{
                     if(planEntry != undefined && Object.keys(planEntry).indexOf('id')==0){
                       bot.reply(message,`Test Plan created! https://bbcpodtest.testrail.com/index.php?/runs/overview/${projectId} Plan ID :: ${plan.id}`);
                       convo.status = 'completed';
                     }else if (planEntry != undefined && Object.keys(planEntry).indexOf('error')==0) {
                       bot.reply(message,`Error in creating Test plan, please retry :: ${planEntry.error}`);
                       convo.gotoThread('no_response');
                     }else {
                       bot.reply(message,`Error in creating Test plan, please retry :: ${planEntry}`);
                       convo.gotoThread('no_response');
                     }
               })
            }
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
    ],{},'create_test_plan_without_devices');

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
