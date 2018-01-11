const outcome = require('./outcome.json')
const moment = require('moment')
const fs = require('fs')
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
  let minTime = arr[0]["Min-Time"]
  let maxTime = arr[0]["Max-Time"]
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
  return (max.diff(min, 'minutes'))
}
