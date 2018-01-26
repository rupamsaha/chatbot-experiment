const outcome = require('../source/outcome_191.json')
const moment = require('moment')
const fs = require('fs')
const _ = require('lodash')
let data = []


exports.trainingData = () => {
    outcome["TestPacks"].forEach((regressions) => {
    data.push([findTotalTestCases(regressions["Execution"]), regressions["TotalDevices"], regressions["MaxResourceCount"], findTime(regressions["Execution"])])
  })
  console.log(data)
  return data
}

function findTotalTestCases(arr) {
  let totaltcs = arr[0]["TotalTestcases"]
  arr.forEach((block) => {
    if (block["TotalTestcases"] > totaltcs)
      totaltcs = block["TotalTestcases"]
  })
  return totaltcs
}

function findTime(arr) {
  let minTime = moment.unix(arr[0]["Min-Time"])
  let maxTime = moment.unix(arr[0]["Max-Time"])
  arr.forEach((block) => {
    if (block["Min-Time"] < minTime) {
      minTime = block["Min-Time"]
    }
    if (block["Max-Time"] > maxTime) {
      maxTime = block["Max-Time"]
    }
  })
  var max = moment.unix(maxTime)
  var min = moment.unix(minTime)
  return (max.diff(min, 'hours'))
}

function findTime(arr) {
  let times = {}
  arr.forEach((block) => {
      var minDate = moment.unix(block["Min-Time"]).date()
      if (times[minDate] && times[minDate].min) {
        if (times[minDate].min > moment.unix(block["Min-Time"])) {
            times[minDate].min = moment.unix(block["Min-Time"])
        }
      }else if (times[minDate]){
          times[minDate].min = moment.unix(block["Min-Time"])
      }
      else {
          times[minDate] = {"min" : moment.unix(block["Min-Time"])}
      }
      var maxDate = moment.unix(block["Max-Time"]).date()
      if (times[maxDate] && times[maxDate].max) {
        if (times[maxDate].max < moment.unix(block["Max-Time"])) {
            times[maxDate].max = moment.unix(block["Max-Time"])
        }
      }else if (times[maxDate]){
          times[maxDate].max = moment.unix(block["Max-Time"])
      }else {
          times[maxDate] = {"max": moment.unix(block["Max-Time"])}
      }
  })
  var finalTime = _.sum(_.map(times, (value, key) => {
    if(!value.max){
        value.max = value.min
    }
      return (value.max).diff(value.min, 'minutes')
  }))
  return finalTime
}
