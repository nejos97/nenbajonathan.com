---
author: Jonathan Nenba
pubDatetime: 2022-11-04T14:50:18Z
modDatetime: 2022-11-04T14:50:18Z
title: 'Package management basics for web developer'
slug: package-management-basics-for-web-developer
featured: false
draft: false
tags:
  - package
  - npm
  - yarn
  - pip
  - go modules
description: Know what a package manager is and which are the most used and how they work.
---

As a developer, you will realize that most of the time we will write code and try to solve problems by writing code, from day to day a repetition will be created not only in the project you are working on but also when you will switch between different projects, sometimes it will be small implementations and sometimes big changes that will push you to copy and paste big blocks of code.

Many developers have been facing this dilemma since the beginning of time and many solutions have been proposed, so I'd like to discuss today about the package manager.

A package manager is a tool or application that allows developers to add and manage dependencies in their projects (or add them to your project and also the possibility to write your own packages.)

In reality you don't need the packager manager, you can do it manually, download and reference the library in your code and use it, but it will become very tedious especially when the list starts to become big and you should take into account the different versions compatible with your code base.

For the package manger to work, it must know where it has to go to get the dependencies, this is where the __Package Registry__ comes in. So we can define them as a warehouse where are stored the different packages according to their version, in this way the developer can decide which version of a package he wants to add in his project. It should also be noted that it is possible to have its own package registry often used for packages specific to a company.

The package manager differs from the programming languages, we will discover the most used for which programming languages: Javascript, Python and Go

#### Javascript

The most popular package manager in javascript is __npm__, it comes as soon as you install node in your machine. 
By initializing your application to use npm, it will create a __package.json__ file in your project, it will contain the different information of your application and also the list of all the dependencies you had used in your project.
```bash
npm init
```
```bash
npm install axios
```

The second package manager is __yarn__, which respect the same principle of operation as npm, it also has its specificity I invite you to read [this article](https://www.freecodecamp.org/news/javascript-package-manager-npm-and-yarn/)

The most used package registry for these package manager are [NPM Registry](https://www.npmjs.com/) and [Github Packages](https://github.com/features/packages).

#### Python

Like __npm(Node Package Manager)__ and __Yarn(Yet Another Resource Negotiator)__, python also has its own package registry which is The [__Python Package Index__](https://pypi.org/) (PyPI) which is the repository that contains all the applications that you can add to yours as depandances.

By installing python you get pip which is the standard package manager of python, next to that you find Pipenv and Postry which are also very successful in the community.

```bash
pip install faker
```

Or you can launch the installation from your requirements.txt file(this file content the list of depqndqnies to the projet with their version)
```bash
pip install -r requirements.txt
```

little tip to use to create a requirement file that will contain the list of all your depandancies
```bash
pip freeze >> requirements.txt
```

#### Go

__Go Modules__ is the easiest way to manage your depandaces in Go, to initialize it you just have to launch the command

```bash
go mod init
```
This command will create the go.mod which is the equivalent of the package.json file for javascript. 
To add a package you have to run the command go get ... followed by the reference of your package, it can be a name from the official go registry or the link to a go package on Github.

```bash
go get github.com/rs/zerolog@v1.14.3
go get github.com/go-chi/chi@master
```

package management in projects is a bigger topic, I hope we will have time to share more in the future, this post was intended to briefly introduce you to the different package managers and their use. 

-  [[1] Freecodecamp "JavaScript Package Manager – Complete Guide to NPM and Yarn" , https://www.freecodecamp.org/news/javascript-package-manager-npm-and-yarn/](https://www.freecodecamp.org/news/javascript-package-manager-npm-and-yarn/)

-  [[2] Mdn Web Docs "Package management basics" , https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Package_management](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Package_management)

-  [[3] Alexander Diachenko Medium's "Package Management With Go Modules: The Pragmatic Guide" , https://medium.com/@adiach3nko/package-management-with-go-modules-the-pragmatic-guide-c831b4eaaf31](https://medium.com/@adiach3nko/package-management-with-go-modules-the-pragmatic-guide-c831b4eaaf31)