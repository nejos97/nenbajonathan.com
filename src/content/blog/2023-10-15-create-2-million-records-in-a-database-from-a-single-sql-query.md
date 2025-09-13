---
author: Jonathan Nenba
pubDatetime: 2023-10-15T02:11:00Z
modDatetime: 2023-10-15T02:11:00Z
title: 'Create 2 Million records in a database from a single SQL query'
slug: create-2-million-records-in-a-database-from-a-single-sql-query
featured: false
draft: false
tags:
  - database
  - sql
  - postgres
  - webdev
description: In this post, you'll learn how to generate a mass of data using WITH RECURSIVE clause.
---

More than once in programming, you've had to work with data, but somehow didn't have it, perhaps to test the performance of your queries, the general behavior of your application or to prepare a demo.

For some time now, this should no longer be a problem, as many databases support recursive SQL queries. This means you can generate large amounts of data (thanks to the WITH RECURSIVE clause).

For this post, I'll essentially be using SQLite for my queries, but keep in mind that it works for most of the current DBMS we have (MariaDB 10.2+, MySQL 8.0+, PostgreSQL 8.4+ and SQLite 3.8+. Oracle 11.2+ and SQL Server 2005+).

For our first example, we'll create a fake_data table, then insert 2 million rows into this table with random numerical data. For this example, there will be no field constraints.

```sql
CREATE TABLE fake_data AS
WITH RECURSIVE tmp(x) AS (
    SELECT abs(random() % 99) + 1
    UNION ALL
    SELECT abs(random() % 99) + 1 FROM tmp
    LIMIT 2000000
)
SELECT * FROM tmp;
```

come on, let's explain some of the code we've written:

1. **CREATE TABLE fake_data AS**: This part of the query creates a new table named fake_data where we will store the results of our query.

2. **WITH RECURSIVE tmp(x) AS**: This starts a common table expression (**CTE**) named tmp. A **CTE** is a temporary result set that you can reference within the main query.

3. **(SELECT abs(random() % 99) + 1)**: In the **CTE**, we start with a SELECT statement that generates a random number between 1 and 99 (inclusive) using the random() function and takes the absolute value with abs. This generates the initial value for the column x in the tmp **CTE**.

4. **UNION ALL**: This is used to combine the result of the initial SELECT statement with the results of the subsequent SELECT statement. It's used in a recursive **CTE** to keep adding rows to the result set.

5. **SELECT abs(random() % 99) + 1 FROM tmp**: This is the recursive part of the **CTE**. It selects another random number between 1 and 99 and adds it to the result set. The FROM tmp part means that it's selecting from the tmp **CTE** itself, which creates a recursive loop.

6. **LIMIT 2000000**: This is a limit applied to the recursive part of the **CTE** to stop the recursion after 2,000,000 rows have been generated. This is done to prevent an infinite loop.

7. Finally, **SELECT * FROM tmp**; retrieves all the rows from the tmp **CTE**, which now contains 2,000,000 random numbers between 1 and 99 (inclusive).

In summary, this query generates a table named fake_data containing 2,000,000 random integers between 1 and 99 using a recursive common table expression (**CTE**). It starts with an initial random number and then keeps adding more random numbers until it reaches the limit of 2,000,000 rows.

Creating a table with numbers only isn't interesting, so we're going to generate some more concrete user data.

Let's suppose we have a users table with ID, name and age fields. We'll create 2 million entries in our use table as follows:

1. ID will be numeric and incremental (1, 2, 3,...)
2. name will be randomly selected from another table with 5 names
3. age will be a random number chosen between 1 and 99

So we're going to create a table containing only the names

```sql
CREATE TABLE IF NOT EXISTS names(id integer primary key, name text);

INSERT INTO names(id, name) VALUES (1, 'Alex'), (2, 'Annita'), (3, 'Coco'), (4, 'Sundar'),(5, 'Zuck');
```

```sql
CREATE TABLE IF NOT EXISTS persons AS
WITH RECURSIVE tmp(id, idx, name, age) as (
	SELECT 1, 1, 'Ann', 20
	UNION ALL
	SELECT
		tmp.id + 1 as id,
		abs(random() % 5) + 1 as idx,
		(SELECT name FROM names WHERE id = idx) as name,
		abs(random() % 99 ) + 1 as age
	FROM tmp
	LIMIT 2000000 
) SELECT id, name, age FROM tmp;
```

In summary, this SQL statement creates a table called "persons" and populates it with up to 2,000,000 rows of randomly generated data, including names selected from another table. The recursive **CTE** is used to generate the data in a recursive manner until the specified limit is reached.

In conclusion, for developers focused on testing, employing a single SQL query to generate random data within a database is a powerful and time-saving strategy. This method facilitates comprehensive testing scenarios, ensuring robustness and reliability in software applications. By harnessing the simplicity of SQL queries, developers can efficiently create randomized datasets, ultimately enhancing the quality and effectiveness of their testing processes.
