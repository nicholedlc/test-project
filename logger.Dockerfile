FROM sumologic/collector:latest-no-source
MAINTAINER Nichole De La Cruz
ADD sumo-sources.json /etc/sumo-sources.json
