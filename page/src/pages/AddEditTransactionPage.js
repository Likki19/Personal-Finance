import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';

// Define the GraphQL queries and mutations
const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      id
      description
      amount
      type
    }
  }
`;

const ADD_TRANSACTION = gql`
  mutation AddTransaction($description: String!, $amount: Float!, $type: String!) {
    addTransaction(description: $description, amount: $amount, type: $type) {
      id
      description
      amount
      type
    }
  }
`;

const EDIT_TRANSACTION = gql`
  mutation EditTransaction($id: ID!, $description: String!, $amount: Float!, $type: String!) {
    editTransaction(id: $id, description: $description, amount: $amount, type: $type) {
      id
      description
      amount
      type
    }
  }
`;

const AddEditTransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('income');

  // Fetch transaction data if editing
  const { data, loading, error } = useQuery(GET_TRANSACTION, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if (data) {
      setDescription(data.transaction.description);
      setAmount(data.transaction.amount);
      setType(data.transaction.type);
    }
  }, [data]);

  // Handle mutations
  const [addTransaction, { error: addError }] = useMutation(ADD_TRANSACTION);
  const [editTransaction, { error: editError }] = useMutation(EDIT_TRANSACTION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await editTransaction({
          variables: { id, description, amount: parseFloat(amount), type },
        });
      } else {
        await addTransaction({
          variables: { description, amount: parseFloat(amount), type },
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error submitting transaction:', error.message);
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Transaction' : 'Add Transaction'}</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error fetching transaction data: {error.message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <button type="submit">{id ? 'Update' : 'Add'}</button>
      </form>
      {addError && <p>Error adding transaction: {addError.message}</p>}
      {editError && <p>Error updating transaction: {editError.message}</p>}
    </div>
  );
};

export default AddEditTransactionPage;
