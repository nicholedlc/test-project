# Test Project
A dashboard-style application that displays a list of all docker containers in a machine and other useful information about them.

## Usage with `docker-compose`
- Run `docker-compose up test-project`
- Go to [localhost:4040](http://localhost:4040)

## Usage with Docker Swarm
- Make sure that Swarm is enabled on your Docker Desktop by typing `docker system info`, and looking for a message `Swarm: active`. If Swarm isn’t running, type `docker swarm init` in a shell prompt to set it up.
- Deploy the test project to Swarm: `docker stack deploy -c test-project-stack.yml demo`
- Go to [localhost:5050](http://localhost:5050)

  ### Send and View Logs in Sumo Logic
  - ***Prerequisite***: [Access Keys](https://help.sumologic.com/Manage/Security/Access-Keys) from Sumo Logic
  - Click the `Create log collector service` button at the bottom of the **Docker Services** section.
  - Fill in the form with your Access ID and Access Key
  - Click `Create`.
  - If you don't see the log collector container right away, refresh the page.
  - Go to Sumo Logic and check the logs.