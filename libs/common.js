const crypto=require('crypto')

module.exports={
  MD5_SUFFIX: '923101315',
  md5: function (str){
  	// crypto.createHash（algorithm [，options]）
    var obj=crypto.createHash('md5')

    obj.update(str)

    return obj.digest('hex')
  }
}
