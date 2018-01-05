const LinearRegression = require('shaman').LinearRegression,
      data = require('./createTrainingData').trainingData()

function trainBot(filepath, callback) {
  let X = data.map(function(r) {
    return [Number(r[0]), Number(r[1])]
  })
  let y = data.map(function(r) {
    return Number(r[2])
  })

  // Initialize and train the linear regression
  let lr = new LinearRegression(X, y, {algorithm: 'NormalEquation'});
  lr.train(function(err) {
    if (err) {
      console.log('error', err);
      process.exit(2);
    }
  })
  callback(lr)
}

module.exports = {
    trainBot: trainBot
}
