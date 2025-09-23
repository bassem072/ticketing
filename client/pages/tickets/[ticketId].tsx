import { AxiosInstance } from 'axios';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const ShowTicket = ({ currentUser, ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: ticket ? { ticketId: ticket.id } : {},
    onSuccess: (order) => Router.push(`/orders/${order.id}`),
  });

  const onPurchase = async (event) => {
    event.preventDefault();
    await doRequest();
  };

  if (!currentUser) {
    return <h1>You are not signed in</h1>;
  }

  if (!ticket) {
    return <h1>Ticket not found</h1>;
  }

  return (
    <div className="mt-4">
      <h1>{ticket.title}</h1>
      <h4>Price: ${ticket.price}</h4>
      {errors}
      <button className="btn btn-primary mt-3" onClick={onPurchase}>
        Purchase
      </button>
    </div>
  );
};

ShowTicket.getInitialProps = async (
  context,
  client: AxiosInstance,
  currentUser
) => {
  const { ticketId } = context.query;

  if (!currentUser) {
    return { ticket: null };
  }

  try {
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data };
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { ticket: null };
    }
    throw err; // rethrow if it's not a 404
  }
};

export default ShowTicket;
