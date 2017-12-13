const express = require('express')

module.exports = function() {
	var router = express.Router()

	// 检查登陆状态
	router.use((req, res, next) => {
		if (!req.session['admin_id'] && req.url != '/login') {
			res.redirect('/admin/login') //沒有登陸则跳到login页面
		} else {
			next()
		}
	})


	router.get('/', (req, res) => {
		res.render('admin/index.ejs', {})
	})

	router.use('/login/', require('./login.js')()) //引入模块.js可以省略 ./login.js可写成./login

	router.use('/banners/', require('./banners.js')())   //但凡是banners的东西，找banners.js去
    // router.use('/blog/', require('./blog.js')())
    router.use('/custom/', require('./custom.js')())
	return router
}