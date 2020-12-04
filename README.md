# Oldish_Microservices
Oldish with a scalable but expensive architecture
Event driven microservice architecture based on database per service setup. 
To be developed in Google Cloud Kubernetes Engine with skaffold and deployed with CI/CD pattern through github actions and using a load-balancer.
Uses NextJs as frontend,ingress-nginx and Nats streaming server for message/events and versioning to handle concurrency issues.
Made to have a common response structure so that additional services can be written in any language and communicate through json.
