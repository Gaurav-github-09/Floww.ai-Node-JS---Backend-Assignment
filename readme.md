# Floww.ai Node JS - Backend Assignment

### Assignment: Personal Expense Tracker

### Objective:

Develop a RESTful API for managing personal financial records. Users can record their income and expenses, retrieve past transactions, and get summaries by category or time period.

### Tools and Technologies:

- **Backend Framework**: Node.js with Express.js
- **Database**: SQLite

setup information-(read in code view of git for better clarity)

install all the following npm dependencies

command - npm install <belowDependencies> --save

nodemon
bcrypt
jsonwebtoken
express
sqlite
sqlite3

There are 3 tables users, transactions and categories linked to each other through primary keys and foreign keys

users table with columns:-
id,	username,	password

categories table with columns :-
id,  name,  type(income or expense),  user_id 

transactions table with columns:-
id,  type(income or expense),  category_id,  amount,  date,  description,  user_id

I added a sample categories and transaction details of a User. You can follow the registration of user process and then login with json token authentication and get RestAPI resutls

steps to achieve outcome (check the app.http file)

1 - register with given sample username and password

2 - login with same given sample user credentials. You will receive a jsonToken for authentication in response 

3 - add the Json token for all the RestAPI's for successfully passing the authentication test and also to get the required API results

sample users table details:
{
  "username": "GauravKumar",
  "password": "gaurav@node"
}

--------------

sample categories table details:-

id	name	                    type 	         user_id

1	Salary	                   income	              1
2	Investment Income	         income	              1
3	Rent	                     expense	            1
4	Utilities	                 expense	            1
5	Groceries	                 expense	            1
6	Transportation	           expense	            1
7	Entertainment	             expense	            1

--------------

sample transactions table details:-

id	type	   category_id	 amount	       date	       description	  user_id

1	income	       1	     5000.00	2024-10-01	 Monthly salary	         1
2	income	       2	     2000.00	2024-10-15	 Dividend payment	       1
3	expense	       3	     1000.00	2024-10-05	 Monthly rent	           1
4	expense        4	      200.00	2024-10-10	 Electricity bill	       1
5	expense	       5	      500.00	2024-10-15	 Groceries	             1
6	expense	       6	      300.00	2024-10-20	 Fuel cost	             1
7	expense	       7	      100.00	2024-10-25	 Movie tickets	         1
______________________________

Following are the details about RestAPI's

1 GET /transactions

Description: Retrieves all transactions for the authenticated user.

Request:
Authorization header: Bearer <your-token>

Response:
Status code: 200 OK
Body:
JSON
[
        {
            "id": 1,
            "type": "income",
            "category_id": 1,
            "amount": 1000.00,
            "date": "2024-10-01",
            "description": "Salary"
        },
        // ... other transactions
   
    
]

-------------------------

2 GET /transactions/:id

Description: Retrieves a specific transaction by ID for the authenticated user.

Request:
Authorization header: Bearer <your-token>
Path parameter: id (transaction ID)

Response:
Status code: 200 OK if transaction found, 404 Not Found if not found
Body:
JSON
{
    "id": 1,
    "type": "income",
    "category_id": 1,
    "amount": 1000.00,
    "date": "2024-10-01",
    "description": "Salary"
}

-------------------------

3 POST /transactions

Description: Adds a new transaction for the authenticated user.

Request:
Authorization header: Bearer <your-token>
Body:
JSON
{
    "type": "income",
    "category_id": 1,
    "amount": 1000.00,
    "date": "2024-10-01",
    "description": "Salary"
}

Response:
Status code: 201 Created
Body:
JSON
{
    "message": "Transaction added successfully"
}

-------------------------

4 PUT /transactions/:id

Description: Updates a transaction by ID for the authenticated user.

Request:
Authorization header: Bearer <your-token>
Path parameter: id (transaction ID)
Body:
JSON
{
    "type": "income",
    "category_id": 1,
    "amount": 1000.00,
    "date": "2024-10-01",
    "description": "Salary"
}

Response:
Status code: 200 OK
Body:
JSON
{
    "message": "Transaction updated successfully"
}

-------------------------

5 DELETE /transactions/:id

Description: Deletes a transaction by ID for the authenticated user.

Request:
Authorization header: Bearer <your-token>
Path parameter: id (transaction ID)

Response:
Status code: 200 OK
Body:
JSON
{
    "message": "Transaction deleted successfully"
}

-------------------------

6 GET /reports/monthly-spending

Description: Generates a monthly spending report by category for the authenticated user.

Request:
Authorization header: Bearer <your-token>

Response:
Status code: 200 OK
Body:
JSON
[
    {
        "category_id": 1,
        "total_spending": 1000.00
    },
    // ... other categories
]
