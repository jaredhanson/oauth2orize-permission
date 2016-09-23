var url = require('url')
  , qs = require('querystring');

// TODO: Make the paramatizable
var html =
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
  '<title>Connecting ...</title>' +
  '<!--<script data-main="../../js/storagerelay" src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.js"></script>-->' +
  '<script type="text/javascript" src="../../js/storagerelay.js"></script>' +
'</head>' +
'<body>' +
  '<script type="text/javascript">' +
    'var done = function() {window.close();};' +
    'oauth2.idpIFrame.relay({RESPONSE}, "{REQUEST_ID}", "{CLIENT_ID}", "{TARGET_ORIGIN}", done);' +
  '</script>' +
'</body>' +
'</html>';



exports = module.exports = function (txn, res, params) {
  var parsed = url.parse(txn.redirectURI, true);
  
  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Pragma', 'no-cache');
  
  return res.end(html.replace('{TARGET_ORIGIN}', txn.locals.webOrigin)
                     .replace('{CLIENT_ID}', txn.client.id)
                     .replace('{REQUEST_ID}', parsed.query.id)
                     .replace('{RESPONSE}', JSON.stringify(params)));
};


exports.validate = function(txn) {
  if (!txn.redirectURI) { throw new Error('Unable to relay via storage for OAuth 2.0 transaction'); }
};
