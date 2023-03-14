var url = require('url');

module.exports = function() {
  
  function request(req) {
    var q = req.query
      , ext = {};
    
    if (q.redirect_uri) {
      var uri = url.parse(q.redirect_uri, true);
      if (uri.protocol === 'storagerelay:') {
        ext.responseMode = 'storagerelay';
        ext.id = uri.query.id;
      }
    }
    
    return ext;
  }
  
  var mod = {};
  mod.name = '*';
  mod.request = request;
  return mod;
}
