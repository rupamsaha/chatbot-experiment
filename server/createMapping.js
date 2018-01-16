const fs = require('fs')
const hash = {}

var array = fs.readFileSync('output.txt').toString().split("\n");
array.forEach((data) => {
  hash[data] = []
})

fs.writeFileSync('mapping.json', JSON.stringify(hash))

console.log(hash)
