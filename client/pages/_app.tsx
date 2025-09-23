import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (context) => {
  const client = buildClient(context.ctx);

  const { data } = await client.get('/api/users/current-user');

  const pageProps = context.Component.getInitialProps
    ? await context.Component.getInitialProps(
        context.ctx,
        client,
        data.currentUser
      )
    : {};

  return {
    ...data,
    pageProps,
  };
};

export default AppComponent;
