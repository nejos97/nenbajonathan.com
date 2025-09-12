---
author: Jonathan Nenba
pubDatetime: 2023-09-15T19:17:18Z
modDatetime: 2023-09-15T19:17:18Z
title: 'Scheduling tasks in Golang with atomicgo'
slug: scheduling-tasks-in-golang-with-atomicgo
featured: false
draft: false
tags:
  - go
  - tasks
  - atomicgo
  - programming
description:
  Learn to schedule tasks execution in golang with atomicgo
---

Hi coder, in one way or another in programming, you have once been confronted with the fact of wanting to schedule the execution of certain tasks in your program, whether it's to delete certain unnecessary files, build your application, send birthday mails or even periodically check access and delete when it's out of date; in any case, there are an awful lot of them.

In this new post, we'll take a look at how to do this in golang using atomicgo.

What is atomicgo

Atomicgo is a golang package that offers a lot of ready-to-use functionality to make life easier for go developers.

Before going straight to the code, let's create a context or environment in which we'll practice our example.

Let's say we have a list of user in our database and that each user has the expiry date of their access to our system (this could also be access to our secret room, for example.) Our task will therefore be to write our task executor so that it can periodically check our list and automatically remove all users whose access has expired.

Before going into the code, I assume you've already installed the official Golang website in your environment (Windows, Linux, MacOS).

To get started, create a folder and initialize the go module with this command

```bash
mkdir schedule_tasks
cd schedule_tasks
go mod init nejos97/schedule-tasks
```

Once your module has been initialized, make sure you install the package we need for our little project.

```bash
go get atomicgo.dev/schedule
```

Now that everything's ready, let's create our main package and the user structure we'll be using.

```go
package main

import (
	"fmt"
	"time"
)

type User struct {
	FirstName      string
	LastName       string
	RegisteredDate time.Time
	ExpiredDate    time.Time
}
```

So we're going to add two functions to our code to create a single user and another to return a list of users. To improve the code, you can pass dates to the `getFakeUniqueUser` function so that you can use it with several different dates.

```go
func getFakeUniqueUser() User {
	registerdDate, err := time.Parse(time.DateOnly, "2022-06-08")
	if err != nil {
		fmt.Println(err)
	}

	expiredDate, err := time.Parse(time.DateOnly, "2023-08-08")
	if err != nil {
		fmt.Println(err)
	}

	return User{
		FirstName:      "Fake Firstname",
		LastName:       "Fake Lastname",
		RegisteredDate: registerdDate,
		ExpiredDate:    expiredDate,
	}
}

func getUsers() []User {
	var data []User
	// TODO: Lets get some users in our database here
	data = append(data, getFakeUniqueUser())
	data = append(data, getFakeUniqueUser())
	data = append(data, getFakeUniqueUser())
	return data
}
```

Now we're going to write the function that removes expired users from our list and blocks their access to our system.

```go
func processUsers(users *[]User) {
	var result []User
	for _, user := range *users {
		if user.ExpiredDate.After(time.Now()) {
			result = append(result, user)
			continue
		}
		fmt.Println(fmt.Sprintf("User %s %s expired.", user.FirstName, user.LastName))
	}
	*users = result
}
```

This function takes a pointer to a list of users as a parameter, performs the deletion operation and updates the list with the new values.

To test our code, here's what our hand will look like

```go
func main() {
	var users []User = getUsers()
	processUsers(&users)
	fmt.Println(users)
}
```

When you run this `go run .` code, you'll get something like this on screen

```bash
➜ go run .
[{Fake Firstname Fake Lastname 2022-06-08 00:00:00 +0000 UTC 2023-10-08 00:00:00 +0000 UTC} {Fake Firstname Fake Lastname 2022-06-08 00:00:00 +0000 UTC 2023-10-08 00:00:00 +0000 UTC} {Fake Firstname Fake Lastname 2022-06-08 00:00:00 +0000 UTC 2023-10-08 00:00:00 +0000 UTC}]
```
For the moment, I've created all my users with a valid expiry date.

So, to get to the heart of the matter and see how to use atomicgo in our project, we're going to use the first method offered by the documentation to schedule our execution.

```go
func main() {
	var users []User = getUsers()
	task := schedule.After(5*time.Second, func() {
		processUsers(&users)
	})
	task.Wait()
}
```
In the code above, we've used schedule's `After` function, which takes the second time as a parameter and the function to be executed after the second time has elapsed.

Importantly, it's a non-blocking function, so you can perform other tasks below it without having to wait the 5 seconds.

```go
func main() {
	var users []User = getUsers()
	task := schedule.Every(time.Second, func() bool {
		processUsers(&users)
		return true
	})
	time.Sleep(30 * time.Second)
	task.Wait()
}
```

The `Every` function in the schedule package allows the function to be executed several times after a time specified here as in seconds, which means that our code block will be executed here after every second.

```go
func main() {
	var users []User = getUsers()
	task := schedule.At(time.Now().Add(5*time.Second), func() {
		processUsers(&users)
	})
	task.Wait()
}
```

The function above allows you to execute your task on a specific date, so here I've retrieved the current date and added 5 seconds to obtain a future date and wait for the date to arrive to see my function execute.

As you can see, we store our task in a variable. In fact, there's some information that will let us know certain states of our task.

`task.IsActive()` returns true if the task is still active

`task.ExecutesIn()` returns the duration of our task's next execution

`task.NextExecutionTime()` returns the date of our task's next execution

`task.StartedAt()` returns the time at which our task began execution

I'll leave you to browse through the atomicgo documentation to learn more about all the advantages this library has to offer.

The aim of this tutorial was to give you a brief overview of the atomicgo library and how you can use it to program the execution of certain tasks in your projects.

Thanks for liking it, if you have any recommendations, questions or any other packages you'd like to share please add it in the comments section, I'd love to read it.
