// http://lists.openid.net/pipermail/openid-specs-ab/Week-of-Mon-20151116/005865.html
module.exports = function(options, issue) {
  if (typeof options == 'function') {
    issue = options;
    options = undefined;
  }
  options = options || {};
  
  if (!issue) throw new TypeError('oauth2orize-permission grant requires an issue callback');
  
  var modes = options.modes || {};
  if (!modes.fragment) {
    modes.fragment = require('../response/fragment');
  }
  
  // For maximum flexibility, multiple scope spearators can optionally be
  // allowed.  This allows the server to accept clients that separate scope
  // with either space or comma (' ', ',').  This violates the specification,
  // but achieves compatibility with existing client libraries that are already
  // deployed.
  var separators = options.scopeSeparator || ' ';
  if (!Array.isArray(separators)) {
    separators = [ separators ];
  }
  
  
  /* Parse requests that request `permission` as `response_type`.
   *
   * @param {http.ServerRequest} req
   * @api public
   */
  function request(req) {
    var clientID = req.query['client_id']
      , redirectURI = req.query['redirect_uri']
      , scope = req.query['scope']
      , state = req.query['state'];
      
    if (!clientID) { throw new AuthorizationError('Missing required parameter: client_id', 'invalid_request'); }
    
    if (scope) {
      if (typeof scope !== 'string') {
        throw new AuthorizationError('Invalid parameter: scope must be a string', 'invalid_request');
      }
      
      for (var i = 0, len = separators.length; i < len; i++) {
        var separated = scope.split(separators[i]);
        // only separate on the first matching separator.  this allows for a sort
        // of separator "priority" (ie, favor spaces then fallback to commas)
        if (separated.length > 1) {
          scope = separated;
          break;
        }
      }
      
      if (!Array.isArray(scope)) { scope = [ scope ]; }
    }
    
    return {
      clientID: clientID,
      redirectURI: redirectURI,
      scope: scope,
      state: state
    }
  }
  
  /* Sends responses to transactions that request `permission` as `response_type`.
   *
   * @param {Object} txn
   * @param {http.ServerResponse} res
   * @param {Function} next
   * @api public
   */
  function response(txn, res, next) {
    var mode = 'fragment'
      , respond;
    if (txn.req && txn.req.responseMode) {
      mode = txn.req.responseMode;
    }
    respond = modes[mode];
    
    if (!respond) {
      // http://lists.openid.net/pipermail/openid-specs-ab/Week-of-Mon-20140317/004680.html
      return next(new AuthorizationError('Unsupported response mode: ' + mode, 'unsupported_response_mode', null, 501));
    }
    if (respond && respond.validate) {
      try {
        respond.validate(txn);
      } catch(ex) {
        return next(ex);
      }
    }

    if (!txn.res.allow) {
      var params = { error: 'access_denied' };
      if (txn.req && txn.req.state) { params.state = txn.req.state; }
      return respond(txn, res, params);
    }
    
    function issued(err, loginHint) {
      if (err) { return next(err); }
      if (!loginHint) { return next(new AuthorizationError('Request denied by authorization server', 'access_denied')); }
      
      var tok = {};
      tok['login_hint'] = loginHint;
      tok['client_id'] = txn.client.id;
      if (txn.req && txn.req.state) { tok['state'] = txn.req.state; }
      
      return respond(txn, res, tok);
    }
    
    try {
      var arity = issue.length;
      if (arity == 6) {
        issue(txn.client, txn.user, txn.res, txn.req, txn.locals, issued);
      } else if (arity == 5) {
        issue(txn.client, txn.user, txn.res, txn.req, issued);
      } else if (arity == 4) {
        issue(txn.client, txn.user, txn.res, issued);
      } else { // arity == 3
        issue(txn.client, txn.user, issued);
      }
    } catch (ex) {
      return next(ex);
    }
  }
  
  
  
  /**
   * Return `permission` grant module.
   */
  var mod = {};
  mod.name = 'permission';
  mod.request = request;
  mod.response = response;
  return mod;
}
