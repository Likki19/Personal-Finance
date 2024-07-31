import React from 'react';

function IncomeList({ incomes = [], onEdit, onDelete }) { // Default to empty array if incomes is undefined
  return (
    <div>
      <h3>Income List</h3>
      <ul>
        {incomes.length === 0 ? (
          <li>No incomes available.</li>
        ) : (
          incomes.map(income => (
            <li key={income.id}>
              {income.description}: ${income.amount}
              <button onClick={() => onEdit(income)}>Edit</button>
              <button onClick={() => onDelete(income.id)}>Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default IncomeList;
