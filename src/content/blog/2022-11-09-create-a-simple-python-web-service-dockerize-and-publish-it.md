---
author: Jonathan Nenba
pubDatetime: 2022-11-09T01:51:18Z
modDatetime: 2022-11-09T01:51:18Z
title: 'Create a simple python web service, dockerize and publish it'
slug: create-a-simple-python-web-service-dockerize-and-publish-it
featured: false
draft: false
tags:
  - python
  - api
  - fastapi
  - docker
  - uvicorn
description: Set up a python API with FastAPI, build a docker image and publish it on the docker registry.
---

Welcome to this new post where we will create a simple API and create a docker image that we can store in the official Docker registry.

So what is a web service, it's any application that runs on the internet and allows the processing of data and provides a result, it can be an application that looks for the weather forecast of your city and sends it back to you, or a service that every time you upload images in your online storage space will try to study the data to know you better (this is a bit more complex).

Basically what we are going to implement here is a simple web API that will return some data when some endpoint is called, but before we start what is an API?

#### API

Defined as Application Programming Interface, an API is a set of definition and protocol allowing services or products to communicate without the implementation of a whole one.

To follow this post you will need to know the basics of python, flask and also docker. Have python and docker installed on your machine. 

In this post we are going to develop a Python API to return a certain amount of information (a users for example) so that other services such as a mobile application for example can consume it.

In order to facilitate the development we will use the FastAPI Framework of python for our development. without delay we will start

the first thing is to go to your favorite workspace for me is the `Workspace` folder and create a folder for our project

```bash
mkdir simple-users-api
```

in order to separate our environment from the rest of our python programs the first thing to do is to create a virtual environment

```bash
python3 -m venv .venv
```

you will see a `.venv` file being created. The next step will be to initialize the git repository for our project and to add the `.gitignore` file (which will allow us to ignore certain files or folders when we share our code with other developers)

```bash
git init && touch .gitignore
```

now we can open our folder with our favorite code editor (VS Code for me)
so we'll create a file called `__main.py__` which will contain the code of our little application before that we'll activate our virtual environment with the command

```bash
source .venv/bin/activate
```

We can then install the different python packages that we will need for our application

```bash
pip install fastapi "uvicorn[standard]"
```

When all the steps are finished with success you can type the command if you want to see the different dependencies of your project and also keep them in a `requirements.txt` file so that another developer can easily run your project in his local machine and contribute too.

```bash
pip freeze > requirements.txt
```

you will get a file of this kind.

```
anyio==3.6.2
click==8.1.3
fastapi==0.86.0
h11==0.14.0
httptools==0.5.0
idna==3.4
pydantic==1.10.2
python-dotenv==0.21.0
PyYAML==6.0
sniffio==1.3.0
starlette==0.20.4
typing_extensions==4.4.0
uvicorn==0.19.0
uvloop==0.17.0
watchfiles==0.18.1
websockets==10.4
```

In the following we will write a small program

```python
from typing import Union
from fastapi import FastAPI, HTTPException

app = FastAPI()

class User:
	def __init__(self, id, first_name=None, last_name=None):
		self.id = id
		self.first_name = first_name
		self.last_name = last_name

users = [
	User('4d398f27-3261-45a2-b014-30c90d6e1d30', 'Alice', 'Life'),
	User('a01f2538-c17c-4401-ba53-5b8da27b928f', 'Bob', 'Prink'),
	User('c26a00fd-d4a1-42a4-ae20-ef6a25326cfd', 'Marley', 'Sant'),
]

@app.get("/api/users")
def index():
	return users

@app.get("api/users/{user_id}")
def get_unique(user_id: str):
	found_user = None;
	for user in users:
		if user.id == user_id:
			found_user = user
	if found_user:
		return found_user
	raise HTTPException(status_code=404, detail="User not found")
```

Not too much explanation for our program which exposes two endpoints namely `GET /api/users` and `GET /api/users/{id}` which allows respectively to have the list of users and the information of a user with the id.

to launch our program and see the result run this command in your terminal, you will get the server that is launched and your application will be available at the address `http://127.0.0.1:8000` of your machine

```bash
uvicorn main:app --reload
```

```bash
INFO:     Will watch for changes in these directories: ['*****']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [80035] using WatchFiles
INFO:     Started server process [80037]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Our application is finally ready to be consumed by other services (for the moment our browser).

The next step will be to create an image of our application and from this image create as many containers as we want.

Create the Dockerfile at the root of our project

```
FROM python:3.9

WORKDIR /

COPY ./requirements.txt /

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

```

the Docker file allowing to create our image is ready we can then execute the command and being at the root of our project of course

```bash
docker build . -t nejos97/simple-users-api    
```

`nejos97` here represents my docker pseurdo that will allow me to push my images directly into my account.

To create a container with our image that we just built

```bash
docker run -p 8000:8000 nejos97/simple-users-api 
```

By executing this command our application will be created and launched in the container and available in our local machine on the same port `8000` as the container. So our image contains our dimension and is ready to be published in the docker registry.

For the next step, create an account if you haven't already done so and connect (on Docker Desktop) and then run the following command to push your images on the docker registry

```bash
docker image push nejos97/simple-users-api
```

Through our program I hope that it would have allowed you to know some basics of python web services more precisely the API and also.

-  [[1] FastAPI "FastAPI" , https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
-  [[2] RedHat "What is an API?" , https://www.redhat.com/en/topics/api/what-are-application-programming-interfaces](https://www.redhat.com/en/topics/api/what-are-application-programming-interfaces)