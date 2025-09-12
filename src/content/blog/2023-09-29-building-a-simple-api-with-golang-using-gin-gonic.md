---
author: Jonathan Nenba
pubDatetime: 2023-09-29T07:57:18Z
modDatetime: 2023-09-29T07:57:18Z
title: 'Building a simple API with Golang using Gin-gonic'
slug: building-a-simple-api-with-golang-using-gin-gonic
featured: false
draft: false
tags:
  - golang
  - gin
  - restapi
  - webdev
description:
  I am going to teach you how to create a simple API with Gin-gonic in Go
---

Hello everyone, in this post, I'm going to show you how to create a small Golang API using the Gin-gonic library to expose some resources of your application's.

### Introduction

An HTTP server is a program that runs in a loop on a machine that's usually connected to the Internet (it doesn't have to be, but if you want your server to be accessible anywhere in the world, it must be) and accepts requests, processes them and returns responses. We're not going to do a whole course on how the web works, but I have to make a small list of prerequisites so that you can continue following this post without getting lost.

1. Have a computer (haha I guess you already do)
2. Knowing and understanding how the web basically works
3. Golang coding skills (at least basic syntax)

### Program preparation

Our little api will therefore be a go module. Here we'll initialize our go module and install the package we need.

```bash
mkdir http-server && cd http-server && go init mod nejos97/http-server
```

The above command will create the http-server folder and initialize it as a Golang module.

```bash
go get github.com/gin-gonic/gin@latest
```

Once in our module, we'll install our Gin package, which will enable us to create an http server more easily.

By the way, what is Gin ?????

In order to make life easier for many developers, packages have been put in place so that we can reuse them and deliver our functionality more quickly, Gin is a Golang framework that allows us to create a production-ready API in just a few lines of code, it already contains all the complexity and certain logic of api server operation. You can get more information on the Gin documentation here (<https://gin-gonic.com/>), which I really recommend you read.
To proceed, we'll create a main.go file in which we'll write our code.

Before getting down to the nitty-gritty of coding, let's define what we're going to do:

This will be a server with 2 or 3 endpoints which will enable us to manage the list of users in our system, return the list, get unique user or add new user.

So, first of all, we're going to define a user's data structure.

```go
type User struct {
	ID          string `json:"id"`
	Firstname   string `json:"firstName"`
	Lastname    string `json:"lastName"`
	Email       string `json:"email"`
	IsActivated bool   `json:"isActivated"`
	Role        string `json:"role"`
}
```

This structure will allow us to create a user with the various fields, and the `json...` notation after each field will allow us to serialize each field in JSON, after which we'll be able to obtain data that looks like this.

```json
{
    "id": "759983a5-3bcd-4af7-9055-88ed43062034",
    "firstName": "Coco",
    "lastName": "Gauff",
    "email": "coco.gauff@usopen.gov.com",
    "isActivated": true,
    "role": "staff"
}
```

Given that we won't be using a database in this little project, we're going to create a list of static users each time we start our application, so that we can initialize and query this data.

```go
var users = []User{
    { ID: "49ed089f-4de1-420d-adcd-274166ea709b", Firstname: "Coco", Lastname: "Gauff", Email: "coco.gauff@usopen.gov.com", IsActivated: true, Role: "staff" },
    { ID: "8021aa9d-24fd-40c2-9092-d82ceda31783", Firstname: "Alex", Lastname: "Marvin", Email: "alex.marvin@usopen.gov.com", IsActivated: true, Role: "admin" },
    { ID: "39ffcd5b-88fa-415f-bdaa-8ccf3e6b6b87", Firstname: "Abdoul", Lastname: "Razak", Email: "abdoul.razak@usopen.gov.com", IsActivated: true, Role: "staff" },
    { ID: "7edaed66-fd82-4b09-96d1-22017cc6f258", Firstname: "Danwe", Lastname: "Aristide", Email: "danwe.aristide@usopen.gov.com", IsActivated: true, Role: "admin" },
}
```

In the rest of our program, we'll create our server with a first endpoint that will return a list of all the users on our system.

```go
func getUsers(c *gin.Context) {
    c.IndentedJSON(http.StatusOK, users)
}

func main() {
    router := gin.Default()
    router.GET("/users", getUsers)
    router.Run(":8080")
}
```

This code is sufficient to launch a server and allow us to test our endpoint. For testing purposes, you're free to use either Postman or Insomnia, or any other software you know that will do the job. Please add this in the comments section so that other developers can try it out. Personally, I use Insomnia for my tests.

After testing the endpoint `localhost:8080/users`, it returns a json containing the list of all the users we statically created earlier.

So some explanation is in order.

c `*gin.context` this line passes the request context pointer to our function and allows us, via the line `c.IndentedJSON(http.StatusOK, albums)`, to directly write the response to be returned by the endpoint.

The function defines the entry point for our program, and it's here that we have an instance of the Gin router, thanks to the gin.Default() function. This instance already contains some middleware, logging and other functions already embedded in Gin, isn't that great? hehe

`router.GET("/users", getUsers)` this line enabled us to map the endpoint to the method to be called, as simple as that.

Now that you've understood a little about how our code works, we'll continue by adding other endpoints, such as the one that will allow us to add a new user to our list.

```go
func addUser(c *gin.Context) {
    var newUser User
    if err := c.Bind(&newUser); err != nil {
        return
    }
    users = append(users, newUser)
    c.IndentedJSON(http.StatusCreated, users)
}

func main() {
    router := gin.Default()
    router.GET("/users", getUsers)
    router.POST("/users", addUser)
    router.Run(":8080")
}
```

So you can see that when you run a test with sample data, it's added directly to the user list. In this tutorial, we're going to ignore the data validation mechanism. We'll come back to it in another tutorial to explain how to manage validation and errors in our system.

The next endpoint we're going to add will enable us to return a single user through his identifier.

```go
func getUserByID(c *gin.Context) {
	id := c.Param("id")
	for _, user := range users {
		if user.ID == id {
			c.IndentedJSON(http.StatusOK, user)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "User Not Found"})
}

func main() {
    router := gin.Default()
    router.GET("/users", getUsers)
    router.POST("/users", addUser)
    router.GET("/users/:id", getUserByID)
    router.Run(":8080")
}
```

In this new code, we first retrieve the ID of the user whose information we wish to find, then we go through our list of users. If we find a user with this ID, we return this, otherwise we exit the loop and return a 404 Not Found response.

The gin.H method is in fact an alias, allowing us to create a dictionary and is used to generate JSON responses.

So, with this little application, we've designed an API with GET and POST methods.

This is just an introduction to creating an API with Gin. Other tutorials will follow, enabling us to refine our API even further, fixing certain bugs, parsing error messages and adding other functionalities.

Below is the complete code we've written throughout this tutorial.

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID          string `json:"id"`
	Firstname   string `json:"firstName"`
	Lastname    string `json:"lastName"`
	Email       string `json:"email"`
	IsActivated bool   `json:"isActivated"`
	Role        string `json:"role"`
}

var users = []User{
	{ID: "49ed089f-4de1-420d-adcd-274166ea709b", Firstname: "Coco", Lastname: "Gauff", Email: "coco.gauff@usopen.gov.com", IsActivated: true, Role: "staff"},
	{ID: "8021aa9d-24fd-40c2-9092-d82ceda31783", Firstname: "Alex", Lastname: "Marvin", Email: "alex.marvin@usopen.gov.com", IsActivated: true, Role: "admin"},
	{ID: "39ffcd5b-88fa-415f-bdaa-8ccf3e6b6b87", Firstname: "Abdoul", Lastname: "Razak", Email: "abdoul.razak@usopen.gov.com", IsActivated: true, Role: "staff"},
	{ID: "7edaed66-fd82-4b09-96d1-22017cc6f258", Firstname: "Danwe", Lastname: "Aristide", Email: "danwe.aristide@usopen.gov.com", IsActivated: true, Role: "admin"},
}

func getUsers(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, users)
}

func addUser(c *gin.Context) {
	var newUser User
	if err := c.Bind(&newUser); err != nil {
		return
	}

	users = append(users, newUser)
	c.IndentedJSON(http.StatusCreated, users)
}

func getUserByID(c *gin.Context) {
	id := c.Param("id")
	for _, user := range users {
		if user.ID == id {
			c.IndentedJSON(http.StatusOK, user)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "User Not Found"})
}

func main() {
	router := gin.Default()
	router.GET("/users", getUsers)
	router.POST("/users", addUser)
	router.GET("/users/:id", getUserByID)
	router.Run(":8080")
}
```

### Conclusion
In this tutorial, our aim was to set up a simple API to perform basic retrieval and addition operations in our data list. I think the basic objective has been reached and you can create your own API and define your own functionalities, as said in the post, I'll create other posts as we go along to improve what we've done so far (adding other middleware, handling all possible errors, hosting our API on AWS, building a docker image... There are so many topics to develop around our little API) I encourage you to practice a lot and research more about Gin (I've shared the link above.).

Thanks for reading this post and don't forget to follow me on X(ex-Twitter)(<https://x.com/nejos97>) and LinkedIn(<https://linkedin.com/in/jnenba>)
