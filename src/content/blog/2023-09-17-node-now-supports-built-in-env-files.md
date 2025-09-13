---
author: Jonathan Nenba
pubDatetime: 2023-09-17T02:00:00Z
modDatetime: 2023-09-17T02:00:00Z
title: 'Node(20.6.0) now supports built-in .env files'
slug: node-20-6-0-now-supports-built-in-env-files
featured: false
draft: false
tags:
  - node
  - env
  - javascript
  - programming
description: Learn how to manage .env with node 20.6.0 without using an external package.
---

Hello javascript lovers, for some time now the new version of node, more precisely version 20.6.0, has been supporting your environment variable file without the need for an external package to do this. Well, in this little post we're going to talk a bit about what this means and how to take full advantage of this improvement, as well as some of the drawbacks or weak points of this feature.

To begin with, environment variables are essential for our code, and their usefulness is well established. This allows us to avoid exposing sensitive data in our source code, and also to easily change certain configurations in our application without having to hardcode them.

In the development world, we're used to using a file to store our data. Often we call it `.env` `.env.local` `env.uat` `.env.prod`, depending on your environment.

In javascript, the essential package for managing configuration files was `dotenv`, which was used, and still is today, to load env files and perform other configuration. Since node version 20.6.0, you can do it without this package.

What's the advantage of using this

Firstly, this means we don't have to depend on an external library, and therefore limit security failures in our code.

more simplicity, so we won't need to install and configure the dotenv package in our project as we used to do.

So without further ado, let's get to work!

So I'm not going to tell you again to install node version 20.6.0 - I assume you've already done that - but for a little tip I recommend using nvm (node version manager), which lets you have several versions of node installed on your computer, so you can easily switch versions independently of the projects you're working on.

create a folder and initialize a project node with the command

```bash
npm init --yes
```

once this is done create two files `index.js` and `.env` at the root of your folder, place this content in the `.env` file

```
PORT=3000
APP_NAME=fake-app-name
LOG_LEVEL=debug
```

and this in the `index.js` file

```javascript
console.log(process.env.PORT)
console.log(process.env.APP_NAME)
console.log(process.env.LOG_LEVEL)
```

Now to launch your little application, type the following command in your terminal and you'll see the contents of your different environment variables displayed.

```bash
node --env-file=.env index.js
```

as you can see, we didn't have to install anything or configure anything to have our variables available in the code, now it's up to you to improve it and define the file by environment.

```json
{
  "name": "test_env",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start:dev": "node --env-file=.env index.js",
    "start:uat": "node --env-file=.env.uat index.js",
    "start:prod": "node --env-file=.env.prod index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

From the release of this announcement there have been some questions about this feature, for example:

It doesn't traverse parent directories, doesn't have good overwrite/merge logic - things that dotenv supported.

It doesn't support multiline variables, which are very important for keys, certificates and JSON configuration.

Above all, it should be noted that this functionality has been made public and that it's up to the community to decide how to improve it and make it more suited to our needs.
