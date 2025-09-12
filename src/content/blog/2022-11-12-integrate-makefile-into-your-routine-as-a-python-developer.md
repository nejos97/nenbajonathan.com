---
author: Jonathan Nenba
pubDatetime: 2022-11-12T08:57:18Z
modDatetime: 2022-11-12T08:57:18Z
title: 'Integrate Makefile into your routine as a Python developer'
slug: integrate-makefile-into-your-routine-as-a-python-developer
featured: false
draft: false
tags:
  - python
  - makefile
  - pip
  - automation
  - venv
description:
  Automatisez vos tâches de développement Python en intégrant un Makefile dans votre workflow quotidien.
---

Although that Makefile is not used too much with the interpreted programming language, make is a wonderful tool and is often misunderstood by some developers.

Some developers consider Make an ancient and used tool nowadays. It's mostly used in the C/C++ world but I think that it deserves more attention.

### Why you should use it ?

When you write a programme and distribute it to users or deploy it on the cloud, the common error or issue that developer always raise is **"it worked on my machine"** Python do a gread job but before you application should be distribute you need some kind of packaging. 

The common solution that some developer found is to write some bash script to automate some task like: install depandancies, run test, run coverage, build software.... goind with bash script will became very tedious when some script depend on another.

It's at this moment that Makefile helps you to fix this kind of issue.

### Let's use Make in Python

In this tutorial, we will create a simple Python app that you a menu with some possible choices to user and ask him to make a choice and provide a result base on the choice.

For start, create a folder for your project and create a file `app_manager.py` with the following code:

```python
def show_menu():
	print("#######################")
	print("1. Generate a name")
	print("2. Generate an address")
	print("3. Generate a credit card")
	print("4. Generate a Company")
	print("5. Quit")
	print("#######################")

def processing_choice(choice: int):
	match choice:
		case 1:
			print("Let's generate a person name...")
		case 2:
			print("Let's generate an address...")
		case 3:
			print("Let's generate a credit card...")
		case 4:
			print("Let's generate a company...")
		case _:
			print("Your choice doens't exist.")
```

lets create another file `app.py` where we use our `app_manager` module

```python
from app_manager import show_menu, processing_choice

while True:
	show_menu()
	choice = int(input("Please enter your choice: "))
	if choice == 5:
		break
	processing_choice(choice)
```

This file app_manager.py module adds some logic to our small project. We don't generate a fake value for our user, to do that we will a python package for that, but before doing that let's create a `requirements.txt` for our project(this file will contain all the dependencies for our project)

Please use python virtual env to separate our project from the existing one that you work on it 
```bash
python3 -m venv venv
```

run: 
```bash
pip install Faker
```

```bash
pip freeze > requirements.txt
```

As the dependencies are installed let's update our manager to add the fake data generation with the Faker python package.

```python
from faker import Faker

faker = Faker()

def show_menu():
	print("#######################")
	print("1. Generate a name")
	print("2. Generate an address")
	print("3. Generate a credit card")
	print("4. Generate a Company")
	print("5. Quit")
	print("#######################")

def processing_choice(choice: int):
	match choice:
		case 1:
			print("Let's generate a person name...")
			print(faker.name())
		case 2:
			print("Let's generate an address...")
			print(faker.address())
		case 3:
			print("Let's generate a credit card...")
			print(faker.credit_card_full())
		case 4:
			print("Let's generate a company...")
			print(faker.company())
		case _:
			print("Your choice doens't exist.")
```

This is the final version of our app, you can simply run it with this command `python app.py`
If everything goes well let's integrate Make into our project to automate the installation of dependencies and running our app.

### The Makefile

To use make in our project, we need to have a `Makefile` in the root of our project, in this file we will give instructions to `make` concern our project.

The Makefile is just a set of rules and each rule have 3 part: a target, a list of prerequisites, and a recipe. 

```yml
target: dependancy1, depandancy2, depandancy3
	recipe line1
	recipe line2
```

let's create the first rule for running our app:

```yml
run:
	python app.py
```

In this case, our target is named `run` and it has no prerequisites, you can test it by running the bash command `make run`

Let's create another rule for requirements/dependencies installation.

```yml
setup: requirements.txt
	pip install -r requirements.txt
```

Here, the setup target depends on the requirements.txt file, Whenever the `requirements.txt` file changes, the dependencies will be refresh bu running `pip install -r`.

The final rule we will add is clean up the **pycache** folder:

```yml
clean:
	rm -rf __pycache__
```

### Virtual environment

Iy you remain well at the benginning of our project we create a virtual envirnment with the goal to seprate our project depandancies with the rest of your project, it's a self contained directory tree that contain python installation of a specific version. 

Different app can use their own virtual envirment where they can install their own reuqirements. 

When its created, you can activate it by running
```bash
source ./venv/bin/activate
```

This environment will stay activated as long as you keep the terminal open or you manually deactivate it. 

### Use venv in Make

Our goal now is to use our venv in `make ` to automatically refresh our env and yun our app. If we want to automatically refresh our dependencies when the requirements.txt file changes we need to add the following command(rule) in our `Makefile`

```yml
/venv/bin/activate: requirements.txt
	python3 -m venv venv
	./venv/bin/pip install -r requirements.txt
```

Here the target is `/venv/bin/activate` whenever therequirements.txt changes, it rebuilds the environment and installs dependencies.
to run our app with the existing environment we need to update our `run`  target

```yml
run: /venv/bin/activate
	./venv/bin/python3 app.py
```

Now our `run` target depends on `/venv/bin/activate`  once the target is run successfully the app is launched.

![image tooltip here](/assets/images/posts/terminal.png)

We need to add some lines in our `clean` target to removing also the `venv`

```yml
clean:
	rm -rf __pychache__
	rm -rf venv
```

Let’s test this all out. First, delete the `venv` directory if you have one. Now run `make run`. Since the `venv/bin/activate` file does not exist, `make` will run the `venv/bin/activate` target, which will install the dependencies and finally run the app using the virtual environment.

Using `make` in your python projects opens the door to a lot of possibilities in terms of automation. With make you can add so many automation steps in your development processes like running tests with `pytest` running linters with `flake8`  or running code coverage with `coverage`. 

If you want to go deep with `Makefile`you can check the official GNU manual on this [link](http://www.gnu.org/software/make/manual/make.html).

- [[1] Earthly "Creating a Python Makefile" , https://earthly.dev/blog/python-makefile/](https://earthly.dev/blog/python-makefile/)

- [[2] Iurii Krasnoshchok's Blog "Makefiles for Python and beyond" , https://medium.com/aigent/makefiles-for-python-and-beyond-5cf28349bf05](https://medium.com/aigent/makefiles-for-python-and-beyond-5cf28349bf05)
