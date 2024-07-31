import React from 'react';
import { Link } from 'react-router-dom';

function TransactionsPage() {
  // Fetch transactions from backend here
  const transactions = [
    { id: 1, description: 'Salary', amount: 1500, type: 'income' },
    { id: 2, description: 'Rent', amount: 500, type: 'expense' },
  ];

  return (
    <div>
      <h2>Transactions</h2>
      <Link to="/transaction">Add New Transaction</Link>
      <ul>
        {transactions.map(transaction => (
          <li key={transaction.id}>
            {transaction.description}: ${transaction.amount} ({transaction.type})
            <Link to={`/transaction/${transaction.id}`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionsPage;
