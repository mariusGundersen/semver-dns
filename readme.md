# semver-dns

Proof of concept semantic versioning DNS server for docker

## Installation

```
npm install semver-dns
```

## Description
Will make it possible to find hosts named based on semantic versioning. For example, the url `http://patch--1.3.8.test.semver` will be directed to `1.3.9.test.semver` (`patch--` is equivalent to `~`).

## Usage

Run on a system with docker as root (to be able to bind to port 53)

```
sudo node server.js
```

Containers that are started and stopped while it is running will be automatically added and removed to the DNS record list.

## Docker

### Service provider
Start a service with a label `SemVerDNS` set to the hostname the container should have. The hostname has to have `semver` as the TLD and cannot contain any subdomains apart from the version. The `semver-dns-test-server` will listen for HTTP requests and will return a json response. You can set the message using the environment variable `MESSAGE`. The name is optional, but is useful for starting and stopping the container

```
docker run -d --label SemVerDNS=1.3.7.test-server.semver -e "MESSAGE=This is version 1.3.7" --name 1.3.7.test-server semver-dns-test-service
docker run -d --label SemVerDNS=1.3.9.test-server.semver -e "MESSAGE=This is version 1.3.9" --name 1.3.9.test-server semver-dns-test-service
```

### Service consumer
Service consumers need access to the dns server, so they need to be started with the dns flag pointing to the docker host (usually `172.17.42.1`). The `semver-dns-test-client` will connect to the server at `SERVICE_PROVIDER` using HTTP and prints the result. The following two lines will connect to two different versions of the test-server started above.

```
docker run -it --rm --dns=172.17.42.1 -e SERVICE_PROVIDER=patch--1.3.7.test-server.semver semver-dns-test-client
```