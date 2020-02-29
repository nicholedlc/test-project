# Test Project
A dashboard-style application that allows the user to see all of the docker containers running in their own machine and other useful information about them.

## Getting Started
- Run `docker-compose up test-project`
- Go to [localhost:4040](localhost:4040)

## Deploy the Test Project to Swarm
- Make sure that Swarm is enabled on your Docker Desktop by typing `docker system info`, and looking for a message `Swarm: active`. If Swarm isn’t running, simply type `docker swarm init` in a shell prompt to set it up.
- Run `docker stack deploy demo`
