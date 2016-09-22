module.exports = function(options, issue) {
  // http://lists.openid.net/pipermail/openid-specs-ab/Week-of-Mon-20151116/005865.html
  
  
  /**
   * Return `permission` grant module.
   */
  var mod = {};
  mod.name = 'permission';
  mod.request = request;
  mod.response = response;
  return mod;
}
