import React from 'react';
import Dashboard from '../components/Dashboard';
import IncomeList from '../components/IncomeList';
import ExpenseList from '../components/ExpenseList';

function DashboardPage() {
  // Fetch data from backend here
  const totalBalance = 1000;
  const totalIncome = 1500;
  const totalExpenses = 500;
  const incomes = [{ id: 1, description: 'Salary', amount: 1500 }];
  const expenses = [{ id: 1, description: 'Rent', amount: 500 }];

  return (
    <div>
      <Dashboard
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />
      <IncomeList incomes={incomes} />
      <ExpenseList expenses={expenses} />
    </div>
  );
}

export default DashboardPage;