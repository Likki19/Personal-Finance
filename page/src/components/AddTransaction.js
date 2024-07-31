import { useMutation } from '@apollo/client';
import { ADD_TRANSACTION } from '../graphql';

function AddTransaction() {
  const [addTransaction, { data, loading, error }] = useMutation(ADD_TRANSACTION);

  const handleAddTransaction = async (description, amount, type) => {
    try {
      const { data } = await addTransaction({
        variables: { description, amount, type },
      });
      console.log('Transaction added:', data.addTransaction);
    } catch (e) {
      console.error('Error adding transaction:', e);
    }
  };

  if (loading) return <p>Adding transaction...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* Form to input transaction details */}
      <button onClick={() => handleAddTransaction('New Transaction', 100, 'income')}>
        Add Transaction
      </button>
    </div>
  );
}

export default AddTransaction;
