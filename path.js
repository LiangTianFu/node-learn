const path = require('path')
var str = 'd://wamp/www/read.html'

var obj = path.parse(str)


// base      文件名部分
// ext      扩展名部分
// dir      文件路径
// name     文件名部分
console.log(obj)