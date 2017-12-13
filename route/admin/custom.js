const express = require('express')
const common = require('../../libs/common')
const mysql = require('mysql')
const pathLib = require('path')
const fs = require('fs')

var db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'learn'
})

module.exports = function() {
  var router = express.Router()

  router.get('/', function(req, res) {
    switch (req.query.act) {
      case 'del':
        //删除文件
        db.query(`SELECT * FROM custom_evaluation_table WHERE ID = ${req.query.id}`, (err, data) => {
          if (err) {
            console.error(err)
            res.status(500).send('查询用户评价数据删除出错').end()
          } else {
            if (data.length == 0) {
              res.status(404).send('需要删除的数据没有发现').end()
            } else { //unlink删除文件操作
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
                      // res.redirect('/admin/custom')  允许网址的重定向，跳转到指定的url并且可以指定status，默认为302方式
                      // 302重定向又称之为302代表暂时性转移(Temporarily Moved )
                    }
                  })
                }
              })
            }
          }
        })
        break;
      case 'mod':
        db.query(`SELECT * FROM custom_evaluation_table WHERE ID=${req.query.id}`, (err, data) => {
          if (err) {
            console.error(err)
            res.status(500).send('用户评价数据查询出错').end()
          } else if (data.length == 0) {
            res.status(404).send('用户评价数据没有发现').end()
          } else {
            db.query(`SELECT * FROM custom_evaluation_table`, (err, evaluations) => {
              if (err) {
                console.error(err)
                req.status(500).send('用户评价数据查询出错').end()
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
  router.post('/', function(req, res) {
    var title = req.body.title
    var description = req.body.description

    if (req.files[0]) {
      // path.parse() 方法返回一个对象，对象的属性表示 path 的元素
      var ext = pathLib.parse(req.files[0].originalname).ext

      var oldPath = req.files[0].path
      var newPath = req.files[0].path + ext

      var newFileName = req.files[0].filename + ext
    } else {
      var newFileName = null
    }

    if (newFileName) {
      // fs.rename(oldPath, newPath, callback)
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error(err)
          res.status(500).send('file opration error').end()
        } else {
          if (req.body.mod_id) { //修改
            //修改需要先删除旧的数据，才能更新新的数据（查询旧的数据，在删除旧数据）
            db.query(`SELECT * FROM custom_evaluation_table WHERE ID=${req.body.mod_id}`, (err, data) => {
              if (err) {
                console.error(err)
                res.status(500).send('用户评价数据查询出错').end()
              } else if (data.length == 0) {
                res.status(404).send('旧数据没有发现').end()
              } else {  //unlink删除文件操作
                fs.unlink('static/upload/' + data[0].src, (err) => {
                  if (err) {
                    console.error(err)
                    res.status(500).send('需要删除的数据删除出错').end()
                  } else { //更新新的数据
                    db.query(`UPDATE custom_evaluation_table SET \
                      title='${title}', description='${description}', \
                      src='${newFileName}' \
                      WHERE ID=${req.body.mod_id}`, (err) => {
                      if (err) {
                        console.error(err)
                        res.status(500).send('数据更新错误').end()
                      } else {
                        res.redirect('/admin/custom')
                      }
                    })
                  }
                })
              }
            })
          } else { //添加
            db.query(`INSERT INTO custom_evaluation_table \
            (title, description, src)
            VALUES('${title}', '${description}', '${newFileName}')`, (err, data) => {
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
    } else {
      if (req.body.mod_id) { //修改
        //直接改
        db.query(`UPDATE custom_evaluation_table SET \
          title='${title}', description='${description}' \
          WHERE ID=${req.body.mod_id}`, (err) => {
          if (err) {
            console.error(err)
            res.status(500).send('数据修改错误').end()
          } else {
            res.redirect('/admin/custom')
          }
        })
      } else { //添加
        db.query(`INSERT INTO custom_evaluation_table \
        (title, description, src)
        VALUES('${title}', '${description}', '${newFileName}')`, (err, data) => {
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

  return router
}