import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Form, FormSection, FormFooter } from '@forge/react';
import { view, invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [context, setContext] = useState(null);
  useEffect(() => {
    view.getContext().then(setContext);
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
  }, []);

  const onSubmit = async () => {
    console.log('submit button clicked');
  };

  return (
    <Form onSubmit={onSubmit}>
      <FormSection>
        <Text>
          {context
            ? `Hello Lucas!, ImportId = ${context.extension.importId}, WorkspaceId = ${context.extension.workspaceId}`
            : 'Lucas context... Loading...'}
        </Text>
        <Text>{data ? data : 'Lucas data... Loading...'}</Text>
      </FormSection>
      <FormFooter>
        <Button appearance="primary" type="submit">
          Save configuration
        </Button>
      </FormFooter>
    </Form>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
