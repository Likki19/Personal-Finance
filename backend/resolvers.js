const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

const REFRESH_SECRET_KEY = 'your-refresh-secret-key';
const ACCESS_SECRET_KEY = 'your-access-secret-key';

const createTokens = (user) => {
  const accessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET_KEY, { expiresIn: '45m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
    totalBalance: (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions
        .filter(transaction => transaction.userId === userId)
        .reduce((acc, transaction) => {
          return acc + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
        }, 0);
    },
    totalIncome: (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions
        .filter(transaction => transaction.type === 'income' && transaction.userId === userId)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    },
    totalExpenses: (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions
        .filter(transaction => transaction.type === 'expense' && transaction.userId === userId)
        .reduce((acc, transaction) => acc + transaction.amount, 0);
    },
    incomes: (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions.filter(transaction => transaction.type === 'income' && transaction.userId === userId);
    },
    expenses: (_, __, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions.filter(transaction => transaction.type === 'expense' && transaction.userId === userId);
    },
    transaction: (_, { id }, { userId }) => {
      if (!userId) throw new Error('Unauthorized');
      return db.transactions.find(transaction => transaction.id === id && transaction.userId === userId);
    },
  },
  Mutation: {
    register: async (_, { username, email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: Date.now().toString(), username, email, password: hashedPassword };
      db.users.push(newUser);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return newUser;
    },
    login: async (_, { email, password }) => {
      const user = db.users.find(user => user.email === email);
      if (!user) throw new Error('User not found');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');
      const tokens = createTokens(user);
      return { ...tokens, username: user.username, userId: user.id };
    },
    refreshToken: async (_, { refreshToken }) => {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
        const user = db.users.find(user => user.id === decoded.userId);
        if (!user) throw new Error('User not found');
        const tokens = createTokens(user);
        return { ...tokens, username: user.username, userId: user.id };
      } catch (err) {
        throw new Error('Invalid refresh token');
      }
    },
    addTransaction: (_, { description, amount, type, userId }) => {
      if (!userId) throw new Error('Unauthorized');
      const newTransaction = { id: Date.now().toString(), description, amount, type, userId };
      db.transactions.push(newTransaction);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return newTransaction;
    },
    editTransaction: (_, { id, description, amount, type, userId }) => {
      if (!userId) throw new Error('Unauthorized');
      const transaction = db.transactions.find(transaction => transaction.id === id && transaction.userId === userId);
      if (!transaction) throw new Error('Transaction not found');
      transaction.description = description;
      transaction.amount = amount;
      transaction.type = type;
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return transaction;
    },
    deleteTransaction: (_, { id, userId }) => {
      if (!userId) throw new Error('Unauthorized');
      const index = db.transactions.findIndex(transaction => transaction.id === id && transaction.userId === userId);
      if (index === -1) throw new Error('Transaction not found');
      db.transactions.splice(index, 1);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      return true;
    },
  },
};

module.exports = resolvers;
