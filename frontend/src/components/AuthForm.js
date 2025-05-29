
import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function AuthForm({ children }) {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={{ padding: '1rem' }}>
          <button onClick={signOut} style={{ float: 'right' }}>Sign Out</button>
          <h2>Welcome, {user?.username}!</h2>
          {children}
        </div>
      )}
    </Authenticator>
  );
}

export default AuthForm;
