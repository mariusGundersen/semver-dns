# semver-dns

Proof of concept semantic versioning DNS server for docker

## Installation

```
npm install semver-dns
```

## Description
Will make it possible to find hosts named based on semantic versioning. For example, the url `http://1.3.8.test.semver` will be directed to `1.3.9.test.semver` (it uses the `^` range by default).

## Usage

Run using docker:

```
DNS_CID=$(docker run -d -v /var/run/docker.sock:/var/run/docker.sock)
DNS_IP=$(docker inspect --format '{{ .NetworkSettings.IPAddress }}' $DNS_IP)
```

Containers that are started and stopped while it is running will be automatically added and removed to the DNS record list.

### Service provider
Start a service with a label `SemVerDNS` set to the hostname the container should have. The hostname has to have a TLD and cannot contain any subdomains apart from the version. The `semver-dns-test-server` will listen for HTTP requests and will return a json response. You can set the message using the environment variable `MESSAGE`. The name is optional, but is useful for starting and stopping the container

```
docker run -d --label SemVerDNS=1.3.7.test-server.semver -e "MESSAGE=This is version 1.3.7" semver-dns-test-service
docker run -d --label SemVerDNS=1.3.9.test-server.semver -e "MESSAGE=This is version 1.3.9" semver-dns-test-service
```

### Service consumer
Service consumers need access to the dns server, so they need to be started with the dns flag pointing to the DNS server container (`$DNS_IP` from earlier). The `semver-dns-test-client` will connect to the server at `SERVICE_PROVIDER` using HTTP and prints the result.

```
docker run -it --rm --dns=$DNS_IP -e SERVICE_PROVIDER=1.3.7.test-server.semver semver-dns-test-client
```

### Dynamic update
You can now add or remove service providers and the dns will update. For example, add `1.4.0.test-server.semver` and rerun the servicue consumer

```
docker run -d --label SemVerDNS=1.4.0.test-server.semver -e "MESSAGE=This is version 1.4.0" semver-dns-test-service
docker run -it --rm --dns=$DNS_IP -e SERVICE_PROVIDER=1.3.7.test-server.semver semver-dns-test-client
docker run -it --rm --dns=$DNS_IP -e SERVICE_PROVIDER=patch--1.3.7.test-server.semver semver-dns-test-client
```

## Versioning rules

* `1.3.7` is equivalent to `^1.3.7`
* `patch--1.3.7` is equivalent to `~1.3.7`
* `exact--1.3.7` is equivalent to `1.3.7`
* `1.3.7-beta.1` is equivalent to `^1.3.7-beta.1`
