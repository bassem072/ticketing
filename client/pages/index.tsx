import Link from 'next/link';
import { AxiosInstance } from 'axios';

const Landing = ({ currentUser, tickets = [] }) => {
  const ticketList = tickets.map((ticket) => (
    <tr key={ticket.id}>
      <td>{ticket.title}</td>
      <td>{ticket.price}</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
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
            <h2 className="text-xl font-semibold">Tickets</h2>
            <Link href="/tickets/new">
              <button className="btn btn-primary">New Ticket</button>
            </Link>
          </div>

          <table className="table mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Title</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Link</th>
              </tr>
            </thead>
            <tbody>{ticketList}</tbody>
          </table>
        </>
      ) : (
        <h1>You are not signed in</h1>
      )}
    </div>
  );
};

Landing.getInitialProps = async (
  context,
  client: AxiosInstance,
  currentUser
) => {
  let tickets = [];
  if (currentUser) {
    const { data } = await client.get('/api/tickets');
    tickets = data;
  }

  return { tickets };
};

export default Landing;
