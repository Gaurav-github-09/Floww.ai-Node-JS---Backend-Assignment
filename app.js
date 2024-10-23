const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

let db = null
const dbpath = path.join(__dirname, 'personalExpense.db')

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}.`)
    process.exit(1)
  }
}

initialize()

//Register User

app.post('/register/', async (request, response) => {
  const {username, password} = request.body

  const hashedPassword = await bcrypt.hash(password, 10)
  const namequery = `select * from users where username= '${username}';`
  const checkedName = await db.get(namequery)
  if (checkedName === undefined) {
    if (password.length > 5) {
      const createUser = `
      Insert into
      users (username, password) 
      values (
        "${username}", '${hashedPassword}'
      )
       ;`

      await db.run(createUser)

      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

//Login User

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  const selectUserQuery = `select * from users WHERE username = '${username}'`
  const dbUser = await db.get(selectUserQuery)
  console.log(dbUser)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
        userId: dbUser.id,
      }
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

//Authentication

const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        request.userId = payload.userId
        next()
      }
    })
  }
}

// 1 Retrieves all transactions for the authenticated user.

app.get('/transactions/', authenticateToken, async (request, response) => {
  const {username, userId} = request
  console.log(username, userId)
  const allTransactionsQuery = `SELECT * FROM transactions where user_id= ${userId} order by id asc;`
  const allTransactions = await db.all(allTransactionsQuery)
  response.send(allTransactions)
})

// 2 Retrieves a specific transaction by ID for the authenticated user.

app.get('/transactions/:id/', authenticateToken, async (request, response) => {
  const {username, userId} = request
  const {id} = request.params
  console.log(username, userId, transactionId)
  const oneTransactionQuery = `SELECT * FROM transactions where id= ${transactionId};`
  const oneTransaction = await db.get(oneTransactionQuery)
  response.send(oneTransaction)
})

// 3 Adds a new transaction for the authenticated user.
app.post('/transactions/', authenticateToken, async (request, response) => {
  const {username, userId} = request
  const {type, categoryId, amount, date, description} = request.body
  console.log(userId, type, categoryId, amount, date, description)
  const createNewTransactionQuery = `INSERT INTO transactions (type,category_id,amount, date, description, user_id)
    VALUES('${type}',${categoryId},${amount},'${date}','${description}',${userId})
    `
  await db.run(createNewTransactionQuery)
  response.send("message: 'Transaction added successfully'")
})

// 4 Updates a transaction by ID for the authenticated user.
app.put('/transactions/:id/', authenticateToken, async (request, response) => {
  const {username, userId} = request
  const {id} = request.params
  const {type, categoryId, amount, date, description} = request.body
  console.log(id, userId, type, categoryId, amount, date, description)
  const updateQuery = `UPDATE transactions 
  SET 
  type= '${type}',
  category_id=${categoryId},
  amount=${amount},
  date='${date}',
  description='${description}',
  user_id =${userId}
  
  WHERE id = ${id};`

  await db.run(updateQuery)
  response.send('"message": "Transaction updated successfully"')
})

// 5 Deletes a transaction by ID for the authenticated user.
app.delete(
  '/transactions/:id/',
  authenticateToken,
  async (request, response) => {
    const {username, userId} = request
    const {id} = request.params
    const deleteQuery = `DELETE 
  FROM transactions 
  WHERE id= ${id};`
    await db.run(deleteQuery)
    response.send('"message": "Transaction deleted successfully"')
  },
)

// 6 Generates a monthly spending report by category for the authenticated user.
app.get(
  '/reports/monthly-spending',
  authenticateToken,
  async (request, response) => {
    const transactionsQuery = `select *  from transactions ;`
    const allTransactions = await db.all(transactionsQuery)
    const totalIncome = allTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((acc, transaction) => acc + transaction.amount, 0)

    const totalExpenses = allTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc, transaction) => acc + transaction.amount, 0)

    const balance = totalIncome - totalExpenses

    console.log(totalIncome, totalExpenses, balance)

    const result = {
      TotalIncome: totalIncome,
      TotalExpenses: totalExpenses,
      Balance: balance,
    }
    response.send(result)
  },
)

module.exports = app
