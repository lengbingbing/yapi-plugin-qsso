const request = require('request');
const parseString = require('xml2js').parseString;
module.exports = function (options) {
  const { loginUrl, emailPostfix } = options;

  this.bindHook('third_login', (ctx) => {

    let ticket = ctx.request.body.ticket || ctx.request.query.ticket;
    let requestUrl = ctx.request.protocol + '://' + ctx.request.host + ctx.request.path;
    let validateUrl = 'https://sso.corpautohome.com/serviceValidate?service=' +  encodeURIComponent('http://apidoc.autohome.com.cn/api/user/login_by_token') + '&ticket=' + ticket;
    console.log('cas url:',validateUrl);
    
    return new Promise((resolve, reject) => {
      request(validateUrl, function (error, response, body) {
        console.log('body:',body);
        if (!error && response.statusCode == 200) {
          parseString(body, function(error, result) {
            if (error) {
              reject(error);
            } else {
              result = result['cas:serviceResponse'];
              if(result['cas:authenticationFailure']) {
                reject(result['cas:authenticationFailure'][0]);
              } else {
                  result = result['cas:authenticationSuccess'][0];
                  let username = result['cas:user'][0]
                  resolve({
                    email: username + emailPostfix,
                    username: username
                  })
              }
            }
          })
        } else {
          reject(error);
        }
      });
    });
  })
}
