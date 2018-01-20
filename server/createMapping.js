const fs = require('fs')
const hash = {}

var array = fs.readFileSync('../source/output.txt').toString().split("\n");
array.forEach((data) => {
  hash[data] = []
})

fs.writeFileSync('../source/mapping.json', JSON.stringify(hash))
