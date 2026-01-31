---
author: Jonathan Nenba
pubDatetime: 2026-01-28T10:00:00Z
title: 'Infrastructure Monitoring: Lessons from Bafoka'
slug: infrastructure-monitoring-without-touching-code
featured: false
draft: false
tags:
  - devops
  - monitoring
  - prometheus
  - grafana
  - kubernetes
  - infrastructure
description: You don't need to change your app code to have great monitoring. Learn how we used Prometheus and Grafana to keep a blockchain platform running at 95.5% uptime.
---

When we built Bafoka, a blockchain platform for community currencies in rural Cameroon, I thought monitoring meant adding tracking code to every service. Instead, we got 95.5% uptime over six months by watching the infrastructure—Kubernetes, databases, storage, and network—without writing any monitoring code.

This wasn't laziness. It was smart.

## Why Monitor Infrastructure, Not Just Apps?

Most guides tell you to add metrics to your code. Import a library, wrap your functions, track everything. That works, but it creates problems.

You end up with different tools for each language. Python uses one library, Go uses another, Node.js has its own. You spend time fixing monitoring code instead of your actual app.

We took a different approach with Bafoka. Our services ran in Python, Go, Node.js, and Soldity. Instead of adding monitoring code to each one, we watched what they all had in common: they all ran in Kubernetes, used CPU and memory, created logs, and connected to databases.

Infrastructure monitoring let us see the entire system without extra work.

## The Platform: Many Services, One Monitoring Plan

Bafoka was part of the OurVillage project by GIZ. It helped rural communities in Cameroon manage digital money and assets. People could use it even with basic phones and limited internet.

We built it using microservices on a DigitalOcean Kubernetes cluster. We used PostgreSQL for data storage, Redis for caching, GitLab for deployments, and Vue.js for the frontend.

With so many different technologies, adding monitoring code to each service would have been a mess. Infrastructure monitoring made it simple.

## Prometheus: Collecting Metrics Without Writing Code

Prometheus collected our metrics, but we didn't write custom metrics in our code. Instead, we used exporters—small tools that share infrastructure data with Prometheus.

**kube-state-metrics** told us about Kubernetes. Pod status, health checks, restarts, and replica counts. We could see if services were running, crashing, or stuck.

**node-exporter** ran on every server, sharing CPU usage, memory, disk activity, and network traffic. Problems at the server level often caused service problems, so catching them early helped.

**postgres-exporter** connected to our PostgreSQL database and shared metrics. Active connections, query speed, transaction rates, database size. We could spot slow queries or connection problems without touching our app's database code.

**redis-exporter** did the same for Redis. Memory usage, cache performance, connected clients. When cache performance dropped, we knew right away.

These exporters needed zero code changes. We installed them, told Prometheus where to find them, and suddenly we could see everything about our infrastructure.

## The Metrics That Really Mattered

With exporters running, we had hundreds of metrics. The hard part was finding the ones that showed real problems.

Pod restarts were the most important signal. A restarting pod meant something crashed. We tracked restart rates and found patterns. Our blockchain service restarted every 72 hours like clockwork. That wasn't normal—it was a sign of trouble.

Memory usage explained those restarts. We looked at memory over seven days and saw it climbing steadily. Memory was leaking. Kubernetes killed the pod when it used too much. Without these metrics, each restart would have looked random. With them, the pattern was clear.

Storage metrics stopped disasters. We watched disk usage and predicted growth. One check told us "database disk will be full in 72 hours." We added more storage before it became a problem. Without monitoring, we would have found out when the database stopped working.

Database connection counts caught problems early. When connections maxed out, new requests had to wait, causing timeouts. Our metrics showed this before users noticed.

Redis connection tracking found leaks. We saw connections grow from 50 to 500+ over hours, getting close to the 512 limit. An alert went off at 93%, and we restarted the service before Redis crashed.

## Grafana: Making Data Easy to Understand

Prometheus collected the data. Grafana made it easy to understand.

Our main dashboard answered one question: "Is everything healthy?" We could see CPU and memory usage, pod status, server health, and storage space. Green meant good, yellow meant watch, red meant fix now.

We built dashboards for specific things. A storage dashboard showed disk usage and predicted when it would fill up. A database dashboard showed connections, transactions, and query speed. A resource dashboard showed which services used the most CPU and memory.

The real power was seeing connections. When memory spiked on a service, we could see if pod restarts, database connections, or network traffic changed at the same time. This made finding problems easy.

These dashboards didn't need custom metrics from our code. Everything came from infrastructure exporters.

## Loki: Automatic Log Collection

We added Loki, Grafana's log system, to connect logs with metrics. Loki collected logs from all pods automatically—no logging code to add, no extra tools to maintain.

When an alert went off for high memory, we could see the logs in the same dashboard. When pods restarted, logs showed why. Memory problem? Database timeout? Network issue? The logs told us.

This was powerful. Metrics showed *what* was happening, logs explained *why*.

## Alerts: Catching Problems Before Users Notice

Grafana alerts became our early warning system. We set up alerts for real problems, not just numbers.

We didn't alert on "CPU above 80%." We alerted on "service has fewer than 2 healthy copies." We didn't alert on "memory at 70%." We alerted on "pod restarted more than 3 times in an hour."

One night, our Redis alert went off. The service was down. We got notified at 2 AM instead of finding out at 9 AM when users complained. We fixed it fast with little impact. That alert saved us from a bad morning.

Another alert warned us when database connections hit 90%. We increased the limit before it maxed out. Without the alert, we would have found out during heavy traffic when requests started failing.

Every alert had to need action. If it went off, someone had to do something. This stopped alert fatigue and kept the team focused on real problems.

## Why Infrastructure Monitoring Works

Infrastructure monitoring works because it watches what runs your app, not what your app does.

Your app might be written in Python, Go, or Node.js. It might handle payments, process images, or stream video. But it always runs in a container, uses resources, writes to a database, and creates logs. Infrastructure monitoring watches these common things.

This approach has benefits beyond being simple. It works for any language. A Python service and a Go service look the same from an infrastructure view—both use CPU and memory, both can crash and restart, both connect to databases. You monitor them the same way.

## What We Learned

The biggest lesson: most problems show up at the infrastructure level first. Memory leaks show as growing pod memory. App bugs cause pod restarts. Database problems show as connection limits. Network problems show in traffic metrics.

By watching infrastructure, we caught problems before users saw them. The blockchain service memory leak was visible days before it caused crashes. The PostgreSQL storage growth was clear weeks ahead. The Redis connection leak showed up hours before it would have hit the limit.

We also learned that infrastructure monitoring works with app monitoring, not instead of it. We still tracked business metrics like transaction counts and user numbers. But for keeping things running, infrastructure metrics were more useful.

Infrastructure monitoring taught us to think about the whole system. A problem in one service often showed up as symptoms in another. Looking at logs and metrics from multiple parts together showed the real issue. App-level monitoring rarely gives you this complete view.

## Better Uptime and Lower Costs

Over six months, we kept 95.5% uptime. We stopped 10+ critical issues before users saw them. We had zero data loss and zero downtime from running out of resources.

Time to find problems dropped from 50 minutes to 15 minutes. Time to fix problems dropped from 4 hours to 1 hour. We could find and fix issues faster because the metrics and logs were already there.

## This Works Anywhere

We ran Bafoka on Kubernetes, but infrastructure monitoring works with any setup.

If you use Docker Swarm, Nomad, or even systemd, you can still use Prometheus and exporters. Node-exporter works on any Linux system. Database exporters work wherever your database runs. The basics don't change.

If you're on AWS, use CloudWatch. On Azure, use Azure Monitor. On DigitalOcean, use their tools or run your own Prometheus. The tools differ, but the idea is the same: watch the infrastructure, not just the code.

Whether you're on cloud or your own servers, whether you use managed services or run your own, infrastructure exists. And watching it gives you what you need to run reliable systems.

## Start Simple, Add More Later

You don't need ten exporters on day one. Start with the basics.

Watch your servers with node-exporter. Watch your database with a database exporter. Collect logs with a system like Loki. Set up a few key alerts: service down, high memory, storage almost full.

This covers most problems. Add more as you grow and learn what matters for your system.

The beauty of infrastructure monitoring is it grows with you. Start with one service, add more when needed. Start with basic metrics, add specialized exporters when problems show up. The monitoring grows with your system, not ahead of it.

## In conlusion

Good software isn't just written. It needs to run well.

For Bafoka, a platform serving rural communities with real money transactions, reliability was critical. Infrastructure monitoring with Prometheus and Grafana gave us that reliability without adding code to every service.

**Infrastructure monitoring** let us see the whole system.  
**Exporters** gave us deep visibility without code changes.  
**Grafana** made complex data easy to understand.  
**Loki** connected logs with metrics for faster fixes.  
**Alerts** caught problems before users noticed.

No matter what language your services use, no matter where they run, infrastructure stays the same. Monitor that, and you'll catch most problems before they cause outages.

**Code, Peace and Love**
