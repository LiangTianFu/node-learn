const express = require('express')
const common = require('../../libs/common')
const mysql = require('mysql')
const fs = require('fs')
const pathLib = require('path')

var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'learn'
})

module.exports = () => {
	var router = express.Router()

	router.get('/', (req, res) => {

		switch (req.query.act) {
			case 'mod':
				db.query(`SELECT * FROM custom_evaluation_table WHERE id=${req.query.id}`, (err, data) => {
					if (err) {
						console.error(err)
						res.status(500).send('用户评价数据查询出错').end()
					} else if (data.length == 0) {
						res.status(404).send('用户评价数据没有发现').end()
					} else {
						db.query('SELECT * FROM custom_evaluation_table', (err, evaluations) => {
							if (err) {
								console.error(err)
								res.status(500).send('用户评价数据查询错误').end()
							} else {
								res.render('admin/custom.ejs', {
									evaluations,
									mod_data: data[0]
								})
							}
						})
					}
				})
				break;
			case 'del':
				//删除文件
				db.query(`SELECT * FROM custom_evaluation_table WHERE ID = ${req.query.id}`, (err, data) => {
					if (err) {
						console.error(err)
						res.status(500).send('查询用户评价数据删除出错').end()
					} else {
						if (data.length == 0) {
							res.status(404).send('需要删除的数据没有发现').end()
						} else {
							fs.unlink('static/upload/' + data[0].src, (err) => {
								if (err) {
									console.error(err)
									res.status(500).send('需要删除的数据删除出错').end()
								} else {
									//删除数据库
									db.query(`DELETE FROM custom_evaluation_table WHERE ID = ${req.query.id}`, (err, data) => {
										if (err) {
											console.error(err)
											res.status(500).send('用户评价数据删除出错').end()
										} else {
											res.redirect('/admin/custom')
										}
									})
								}
							})
						}
					}
				})
				break;
			default:
				db.query(`SELECT * FROM custom_evaluation_table`, (err, evaluations) => {
					if (err) {
						console.error(err)
						res.status(500).send('用户评价数据查询出错').end()
					} else {
						res.render('admin/custom.ejs', {
							evaluations
						})
					}
				})
		}
	})

	router.post('/', (req, res) => {
		var title = req.body.title
		var description = req.body.description

		var ext = pathLib.parse(req.files[0].originalname).ext //扩展名
		var oldPath = req.files[0].path
		var newName = req.files[0].path + ext
		var newFileName = req.files[0].filename + ext


		fs.rename(oldPath, newName, (err, data) => {
			if (err) {
				res.status(500).send('上传失败').end()
			} else {
				if (req.body.mod_id) { //修改
					db.query(`UPDATE custom_evaluation_table SET title='${req.body.title}',description='${req.body.description}',src='${req.body.newFileName}' WHERE ID=${req.body.mod_id}`, (err, data) => {
						if (err) {
							console.error(err)
							res.status(500).send('数据修改错误').end()
						} else {
							res.redirect('/admin/custom')
						}
					})

				} else { // 添加
					db.query(`INSERT INTO custom_evaluation_table (title, description, src) VALUE('${title}', '${description}', '${newFileName}')`, (err, data) => {
						if (err) {
							console.error(err)
							res.status(500).send('用户评价数据插入错误').end()
						} else {
							res.redirect('/admin/custom')
						}
					})
				}
			}
		})

	})

	return router
}