import Link from 'next/link';
import { AxiosInstance } from 'axios';

const Orders = ({ currentUser, orders = [] }) => {
  const renderStatus = (status: string) => {
    switch (status) {
      case 'created':
        return <span className="text-blue-600">⏳ Created</span>;
      case 'cancelled':
        return <span className="text-red-600">❌ Cancelled</span>;
      case 'complete':
        return <span className="text-green-600">✅ Complete</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const orderList = orders.map((order) => (
    <tr key={order.id}>
      <td className="border px-4 py-2">{order.ticket.title}</td>
      <td className="border px-4 py-2">{order.ticket.price}</td>
      <td className="border px-4 py-2">{renderStatus(order.status)}</td>
      <td className="border px-4 py-2">
        <Link href="/orders/[orderId]" as={`/orders/${order.id}`}>
          View
        </Link>
      </td>
    </tr>
  ));

  return (
    <div>
      {currentUser ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <h2 className="text-xl font-semibold">Orders</h2>
          </div>

          {orders.length > 0 ? (
            <table className="table mt-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Ticket</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Link</th>
                </tr>
              </thead>
              <tbody>{orderList}</tbody>
            </table>
          ) : (
            <h4 className="mt-4">No orders found</h4>
          )}
        </>
      ) : (
        <h1>You are not signed in</h1>
      )}
    </div>
  );
};

Orders.getInitialProps = async (
  context,
  client: AxiosInstance,
  currentUser
) => {
  let orders = [];
  if (currentUser) {
    const { data } = await client.get('/api/orders');
    orders = data;
  }

  return { orders };
};

export default Orders;
