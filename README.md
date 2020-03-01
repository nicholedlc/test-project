# Test Project
A dashboard-style application that displays a list of all docker containers in a machine and other useful information about them.

## Usage with `docker-compose`
- Run `docker-compose up test-project`
- Go to [localhost:4040](http://localhost:4040)

## Usage with Docker Swarm
- Make sure that Swarm is enabled on your Docker Desktop by typing `docker system info`, and looking for a message `Swarm: active`. If Swarm isn’t running, type `docker swarm init` in a shell prompt to set it up.
- Deploy the test project to Swarm: `docker stack deploy -c test-project-stack.yml demo`
- Go to [localhost:5050](http://localhost:5050)
