import React from 'react';

function ExpenseList({ expenses = [], onEdit, onDelete }) { // Default to empty array if expenses is undefined
  return (
    <div>
      <h3>Expense List</h3>
      <ul>
        {expenses.length === 0 ? (
          <li>No expenses available.</li>
        ) : (
          expenses.map(expense => (
            <li key={expense.id}>
              {expense.description}: ${expense.amount}
              <button onClick={() => onEdit(expense)}>Edit</button>
              <button onClick={() => onDelete(expense.id)}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ExpenseList;
