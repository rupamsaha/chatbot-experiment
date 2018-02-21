let testcaseCount
let devicesCount
let resourceCount
let colDetails
let request = require('request')

function predictRegressionTime(testCases, devices, resources, callback) {
  const options = {
      url: 'http://localhost:3001/predict',
      qs:{ x: `${testCases},${devices},${resources}`}
  };
  request(options, function(err, res, body) {
    if (err) {
      console.log("Error", err)
    }
    callback((JSON.parse(body)[0]/60).toFixed(2))
  });
}

exports.calculateRegressionTime = (bot, message) => {
    bot.createConversation(message, function(err, convo) {

        // create a path for when a user says YES
        convo.addMessage({
                text: 'You said yes! How wonderful',
                action: 'deviceCount_thread',
        },'yes_thread');

        // create a path for when a user says NO
        convo.addMessage({
            text: 'You said no, Is there any thing else that I can help you with.',
        },'no_thread');

        // create a path where neither option was matched
        // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
        convo.addMessage({
            text: 'Sorry I did not understand.',
            action: 'default',
        },'bad_response');

        // Once the values are confirmed it Done message
        convo.addMessage({
            text: '',
            // action: some_function() call the function to calculate execution time
            action: function(response, convo) {
              predictRegressionTime(colDetails[0], colDetails[1], colDetails[2], (prediction) => {
                bot.reply(message,`*According to my calculations it should take around* :: ${prediction} hour(s)`);
                bot.reply(message, 'Thank you. Happy to serve you. Is there any thing else I can do?');
              })
            }
        },'congratulation');

        convo.addMessage({
            text: 'Ohh! Try Again',
            action: 'deviceCount_thread',
        },'no_response');

        convo.addQuestion(`*Kindly confirm your response?* DeviceCount: *{{vars.devicesCount}}*,TestCaseCount: *{{vars.testcaseCount}}*,ResourceCount: *{{vars.resourceCount}}*`, [
          {
              pattern: 'yes',
              callback: function(response, convo) {
                  convo.gotoThread('congratulation');
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

        // Create a yes/no question in the default thread...
        convo.addQuestion('Do you want me to calculate how much time it will take to complete regression?', [
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

        convo.addQuestion({text: "Kindly tell me total number of *devices Count*, *testcase Count* and *Resource Count* with comma separate?",
         quick_replies: [{content_type: "deviceCount"}]
       }, (res, convo)=>{
         colDetails = res.text.split(',').map(Number)
         convo.setVar('devicesCount', colDetails[0]);
         convo.setVar('testcaseCount', colDetails[1]);
         convo.setVar('resourceCount', colDetails[2]);
         convo.setVar('colDetails', colDetails);
         convo.gotoThread('confirmation_thread');
       },{key: "colDetails"}, 'deviceCount_thread');

       // convo.on('end', function(convo) {
       //    if (convo.status == 'completed') {
       //      bot.reply(message,'Thank you. Happy to serve you. Is there any thing else I can do?')
       //    } else {
       //      bot.reply(message,'Sorry about that, what else can I do for you?')
       //    }
       // })

      convo.activate();
    });

}
