import { useEffect, useRef, useState } from 'react';
import { AxiosInstance } from 'axios';
import useRequest from '../../hooks/use-request';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

const ShowOrder = ({ currentUser, order }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: order ? { orderId: order.id, token: 'tok_visa' } : {},
    onSuccess: (payment) => {
      console.log('Payment successful:', payment);
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
      setPaymentSuccess(true);

      // redirect after 10s
      setTimeout(() => {
        Router.push(`/orders/${order.id}`);
      }, 10000);
    },
  });

  useEffect(() => {
    if (!order || order.status !== 'created') return;

    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();

      if (msLeft <= 0) {
        setExpired(true);
        setTimeLeft(0);
        if (timerIdRef.current) {
          clearInterval(timerIdRef.current);
        }
        return;
      }

      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    timerIdRef.current = setInterval(findTimeLeft, 1000);

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
      }
    };
  }, [order]);

  const onPay = async (props) => {
    await doRequest(props);
  };

  if (!currentUser) {
    return <h1>You are not signed in</h1>;
  }

  if (!order) {
    return <h1>Order not found</h1>;
  }

  let content;

  switch (order.status) {
    case 'created':
      if (paymentSuccess) {
        content = (
          <h4 className="text-success">
            ✅ This order is purchased successfully! <br />
            Redirecting to order details in 10 seconds...
          </h4>
        );
      } else if (expired) {
        content = <h4>Your order is expired</h4>;
      } else {
        content = (
          <>
            <h4>You have {timeLeft} seconds left to order</h4>
            {errors}
            <StripeCheckout
              stripeKey={process.env.STRIPE_KEY}
              token={(token) => onPay({ token: token.id })}
              amount={order.ticket.price * 100}
              email={currentUser.email}
            />
          </>
        );
      }
      break;

    case 'cancelled':
      content = (
        <h4 className="text-danger">❌ This order has been cancelled</h4>
      );
      break;

    case 'complete':
      content = (
        <h4 className="text-success">✅ This order was already completed</h4>
      );
      break;

    default:
      content = <h4>Unknown order status</h4>;
  }

  return (
    <div className="mt-4">
      <h1>Purchase {order.ticket.title}</h1>
      {content}
    </div>
  );
};

ShowOrder.getInitialProps = async (
  context,
  client: AxiosInstance,
  currentUser
) => {
  const { orderId } = context.query;

  if (!currentUser) {
    return { order: null };
  }

  try {
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
  } catch (err: any) {
    if (err.response?.status === 404) {
      return { order: null };
    }
    throw err;
  }
};

export default ShowOrder;
