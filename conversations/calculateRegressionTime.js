let testCases
let devices
let request = require('request')

function predictRegressionTime(testCases, devices, callback){
  const options = {
      url: 'http://localhost:3001/predict',
      qs:{ x: `${testCases},${devices}` }
  };
  request(options, function(err, res, body) {
    if (err) {
      console.log("Error", err)
    }
    callback((JSON.parse(body)[0]/1140).toFixed(2))
  });
}

exports.calculateRegressionTime = (bot, message) => {
  bot.startConversation(message, function(err, convo) {
    if (!err) {
       convo.ask('Please tell me the number of test cases', function(response, convo) {
         var testCases = response.text
         convo.next()
         convo.ask('Thank you, please tell me the number of devices', function(response, convo) {
            var devices = response.text
            convo.next()
            convo.ask(`Please confirm? No. of Test Cases: ${testCases} No. of Devices ${devices}`, [
              {
                pattern: 'yes',
                callback: function(response, convo) {
                  predictRegressionTime(testCases, devices, (prediction) => {
                    bot.reply(message,`According to my calculations it should take around ${prediction} day(s)`)
                    convo.next();
                  })
                }
              },
              {
                pattern: 'no',
                callback: function(response, convo) {
                  convo.stop();
                }
              }
            ])
            convo.next()
        })
       })
       convo.on('end', function(convo) {
          if (convo.status == 'completed') {
            // let prediction = predictRegressionTime(testCases, devices)
            bot.reply(message,`Thank you. Happy to serve you`)
          } else {
            bot.reply(message,'Sorry about that, what else can I do for you?')
          }
       })
    }
  })
}
