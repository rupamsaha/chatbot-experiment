const HttpClientClass = require('@bbc/http-client')
const httpClient = new HttpClientClass()
const _ = require('lodash')

const url = "https://tap-dashboard.tools.bbc.co.uk/graphs/devices/top/past_week"

options = {
  method: 'GET',
  uri: 'https://tap-dashboard.tools.bbc.co.uk/graphs/devices/top',
  timeout: 100000,
  headers: {
    'Keep-Alive': {'timeout': 5, 'max': 10}
  }
}

httpClient.get(options, function(error, response, data) {
  if (!error && response.statusCode == 200) {
      var myRegexp = /var results =(...+)/
      var match = myRegexp.exec(data)
      _.take(JSON.parse(match[1]), 10).map(function (obj) {
          console.log(obj.deviceKey)
      })
  }
})
