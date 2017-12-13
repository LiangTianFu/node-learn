const express = require('express')
const static = require('express-static')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const consolidate = require('consolidate')
const mysql = require('mysql')
const expressRoute = require('express-route')
const multer = require('multer')
const multerObj = multer({
	dest: './static/upload'
})

var server = express()

server.listen(8080)

// 1.获取请求数据
// get自带
server.use(bodyParser.urlencoded())
server.use(multerObj.any())


// 2.cookie.session
server.use(cookieParser());
//防止污染全局变量
(function() {
	var keys = []
	for (var i = 0; i < 10000; i++) {
		keys[i] = 'a_' + Math.random()
	}
	server.use(cookieSession({
		name: 'sess_id',
		keys: keys,
		maxAge: 20 * 60 * 1000 //20minutes
	}))
})()



// 3.模版
//那种模版男引擎//输出什么东西//模板文件放哪
server.engine('html', consolidate.ejs)
server.set('views', 'template')
server.set('view engine', 'html')



// 4.route
// server.use('/', require('./route/web/web.js')())
// server.use('/admin/', require('./route/admin/index.js')())
server.use('/', require('./route/web')())
server.use('/admin/', require('./route/admin')())


// 5.default：static
server.use(static('./static/'))