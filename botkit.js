// if (!process.env.token) {
//     console.log('Error: Specify token in environment');
//     process.exit(1);
// }

const calculateRegressionTime = require('./conversations/calculateRegressionTime').calculateRegressionTime
const createTestCase = require('./conversations/createTestCase').createTestCase

var Botkit = require('botkit');
var wit = require('botkit-witai')({
    accessToken: 'LI5CGZRJNZWQETZ2WS3JMMBAAAZEBVT4',
    logLevel: 'debug'
})
var heading
var steps
var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    // token: process.env.token
    token: 'xoxb-278047956548-DcvOzRb8riFTATHH7ZoOzRTw'
}).startRTM();

controller.middleware.receive.use(wit.receive)

controller.hears('', 'direct_message', function (bot, message) {
  switch(message.entities.Intent[0].value) {
    case 'regression-time':
      calculateRegressionTime(bot, message)
      break
    case 'Create':
      createTestCase(bot, message)
      break
    default:
      bot.reply(message,'I cannot understand this. Please try again!')
  }
})
