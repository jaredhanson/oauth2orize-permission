var url = require('url')
  , qs = require('querystring');

// TODO: Make the paramatizable
var html =
'<!DOCTYPE html>' +
'<html>' +
'<head>' +
  '<title>Connecting ...</title>' +
  '<!--<script data-main="../../js/storagerelay" src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.js"></script>-->' +
  '<script type="text/javascript" src="/oauth2/iframe/js/lib/storagerelay/storagerelay.js"></script>' +
'</head>' +
'<body>' +
  '<script type="text/javascript">' +
    'var done = function() {window.close();};' +
    'OAuth.StorageRelay.relay({RESPONSE}, "{REQUEST_ID}", "{CLIENT_ID}", "{TARGET_ORIGIN}", done);' +
  '</script>' +
'</body>' +
'</html>';



exports = module.exports = function (txn, res, params) {
  res.setHeader('Content-Type', 'text/html;charset=UTF-8');
  res.setHeader('Cache-Control', 'no-cache, no-store');
  res.setHeader('Pragma', 'no-cache');
  
  return res.end(html.replace('{TARGET_ORIGIN}', txn.webOrigin)
                     .replace('{CLIENT_ID}', txn.client.id)
                     .replace('{REQUEST_ID}', txn.req.id)
                     .replace('{RESPONSE}', JSON.stringify(params)));
};


exports.validate = function(txn) {
  if (!txn.webOrigin) { throw new Error('Unable to relay via storage for OAuth 2.0 transaction'); }
  // FIXME: assert that there is a txn.req.id and a web origin??
};
