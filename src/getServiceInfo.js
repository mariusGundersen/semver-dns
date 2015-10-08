
module.exports = function getServiceInfo(result){
  var id = result.Id;
  var service = result.Config.Hostname
    && /.+\.semver$/.test(result.Config.Hostname)
    && result.Config.Hostname
    || '..';
  var ip = result.NetworkSettings.IPAddress;
  var path = service.split('.');
  var network = path.pop();
  var name = path.pop();
  var version = path.join('.');
  return {
    id: id,
    network: network,
    name: name,
    version: version,
    ip: ip
  };
}