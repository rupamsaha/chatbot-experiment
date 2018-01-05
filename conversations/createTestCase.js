let heading
let steps

exports.createTestCase = (bot, message) => {
  bot.startConversation(message, function(err, convo) {
    if (!err) {
       convo.ask('Please write the heading', function(response, convo) {
         heading = response.text
         convo.next()
         convo.ask('Please write the steps', function(response, convo) {
            steps = response.text
            convo.next()
            convo.ask(`Are you happy with the test case? ${heading} ${steps}`, [
              {
                pattern: 'yes',
                callback: function(response, convo) {
                  convo.next();
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
            bot.reply(message,'Uploading the test case')
          } else {
            bot.reply(message,'Sorry about that, what else can I do for you?')
          }
       })
    }
  })
}
