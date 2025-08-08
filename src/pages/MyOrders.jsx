import React, { useEffect, useState } from 'react';

const MyOrders = ({ userEmail }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    const fetchOrders = async () => {
      setLoading(true);
      const res = await fetch(`http://localhost:4000/api/orders/user?email=${userEmail}`);
      const data = await res.json();
      setOrders(data.data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [userEmail]);

  if (!userEmail) {
    return <div style={{ padding: '2rem' }}><h2>Please log in to view your orders.</h2></div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Orders</h2>
      {loading ? <p>Loading...</p> : orders.length === 0 ? <p>No orders found.</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order._id}>
                <td>{order._id.slice(-6).toUpperCase()}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {order.items.map((item, i) => (
                      <li key={i}>{item.name} x {item.quantity} (${item.price})</li>
                    ))}
                  </ul>
                </td>
                <td>${order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders; 