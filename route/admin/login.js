const express = require('express')
const common = require('../../libs/common')
const mysql = require('mysql')

var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'learn'
})

module.exports = () => {
	var router = express.Router()

		router.get('/', (req, res) => {
		res.render('admin/login.ejs', {})
	})

	router.post('/', (req, res) => {
		var username = req.body.username
		var password = common.md5(req.body.password + common.MD5_SUFFIX)

		db.query(`SELECT * FROM admin_table WHERE username = '${username}'`, (err, data) => {
			if (err) {
				console.error('出错了', err)
				res.status(500).send('database error').end()
			} else {
				if (data.length == 0) {
					res.status(404).send('该管理员不存在').end()
				} else {
					if (data[0].password == password) {
						//成功
						req.session['admin_id'] = data[0].ID
						res.redirect('/admin/')
					} else {
						res.status(404).send('密码错误').end()
					}
				}
			}
		})
	})
	return router

}