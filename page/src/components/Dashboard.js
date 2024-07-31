import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import IncomeList from './IncomeList';
import ExpenseList from './ExpenseList';
import Home from './Home';
import AddEditTransactionPage from '../pages/AddEditTransactionPage';
import { GET_DASHBOARD_DATA, ADD_TRANSACTION, EDIT_TRANSACTION, DELETE_TRANSACTION } from '../graphql';
import './styles/Dashboard.css';

const Dashboard = () => {
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
  
  const { loading, error, data, refetch } = useQuery(GET_DASHBOARD_DATA, {
    variables: { userId },
    context: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  });

  const [addTransaction] = useMutation(ADD_TRANSACTION);
  const [editTransaction] = useMutation(EDIT_TRANSACTION);
  const [deleteTransaction] = useMutation(DELETE_TRANSACTION);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login', { replace: true });
  };

  const handleAddTransaction = async (transaction) => {
    await addTransaction({
      variables: { ...transaction, userId },
    });
    refetch();
  };

  const handleEditTransaction = async (transaction) => {
    await editTransaction({
      variables: { ...transaction, userId },
    });
    refetch();
  };

  const handleDeleteTransaction = async (id) => {
    await deleteTransaction({
      variables: { userId, id },
    });
    refetch();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home data={data} />;
      case 'transactions':
        return (
          <AddEditTransactionPage
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'income':
        return <IncomeList incomes={data.incomes} onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} />;
      case 'expenses':
        return <ExpenseList expenses={data.expenses} onEditTransaction={handleEditTransaction} onDeleteTransaction={handleDeleteTransaction} />;
      default:
        return <Home data={data} />;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div className="dashboard-buttons">
        <button onClick={() => setActivePage('home')}>Home</button>
        <button onClick={() => setActivePage('transactions')}>Transaction</button>
        <button onClick={() => setActivePage('income')}>Income</button>
        <button onClick={() => setActivePage('expenses')}>Expenses</button>
      </div>
      <div className="dashboard-content">{renderPage()}</div>
    </div>
  );
};

export default Dashboard;
