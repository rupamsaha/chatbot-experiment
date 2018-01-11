var app = require('express')()
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

var regressionTime = require('./regressionTime')

regressionTime.trainBot((lr) => {
  app.get('/predict', (req, res) => {
      var a = lr.predict(req.query.x.split(','))
      res.send([a])
  })
})

app.listen(3001, () => {
    console.log("Listening to port 3001")
})
