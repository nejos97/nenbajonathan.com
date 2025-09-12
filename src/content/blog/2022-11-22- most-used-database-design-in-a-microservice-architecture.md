---
author: Jonathan Nenba
pubDatetime: 2022-11-22T02:03:18Z
modDatetime: 2022-11-22T02:03:18Z
title: 'Most used database design in a Microservice architecture'
slug: most-used-database-design-in-a-microservice-architecture
featured: false
draft: false
tags:
  - design
  - microservices
  - databases
  - patterns
description:
  Which database design should you choose for your application on microservices architecture?
---

When you heard the word Microservices, what things come to your mind at that time? for me: Database and services communication.

We know that in recent years microservices architecture grow rapidly in the tech ecosystem, and many companies decided to break down their monolith application into microservices, the important decision they face is about the database. Many software engineers or architects decide to keep the same database but this constitutes an anti-pattern particularly for a big system or if the system can grow rapidly.

To solve this issue, a better approach for this kind of system would be to provide each component(or microservices)with its data store to limit or remove coupling between services in a database layer.

Choosing the right database model in microservices designing is one of the most important aspects of microservices because it can rapidly envolve, which could be per services or shared.

![image tooltip here](/assets/images/posts/database_microservices.png)

#### **Complete data to a service ownership**

Here each service can manga its data, when another service wants to access data it requests a specific endpoint created for that, then the services can expose some data to another service on this endpoint; another service cannot connect to the database and query data this cannot happen on this database design.

#### **Individual data stores are easier to scale**

As each component has its data store, it can scale or update the data structure without impacting the other services. So that means if any data failures happened it won't affect other microservices as the other services don't have direct access to the database.

#### **Polyglot persistence**

Microservices enable using of different kinds of data storing technologies, with polyglot persistence each team can decide what kind of database or persistence technology suits the need of the services, we can have a team that works on catalog services choose Postgres database and another team that choose NoSQL database like MongoDB. Keep in mind that using polyglot persistence comes with a cost.

this is a brief view of how and why in microservices architecture we have service-based databases. It should be noted that the subject of databases in microservices covers more study time to know everything about it and build a scalable and scalable system easily. Many patterns exist in each area related to microservices: in the database, programming languages, services discovery, and request redirection...

Here are some topics to deepen your knowledge of the subject

* The Event Sourcing Pattern
* The Saga Pattern
* Command Query Responsibility Segregation

* [[1] Mehmet Ozkaya's blog "Microservices Database Management Patterns and Principles" , https://medium.com/design-microservices-architecture-with-patterns/microservices-database-management-patterns-and-principles-9121e25619f1](https://medium.com/design-microservices-architecture-with-patterns/microservices-database-management-patterns-and-principles-9121e25619f1)

* [[2] OpenReplay Blog "7 Microservice Design Patterns to Use" , https://blog.openreplay.com/7-microservice-design-patterns-to-use/](https://blog.openreplay.com/7-microservice-design-patterns-to-use/)
