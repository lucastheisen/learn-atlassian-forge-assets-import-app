import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Button,
  Form,
  FormFooter,
  FormSection,
  Label,
  Text,
  Textfield,
} from '@forge/react';
import { view, invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [context, setContext] = useState(null);
  const [token, setToken] = useState(null);
  useEffect(() => {
    view.getContext().then(setContext);
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    invoke('newToken').then(setToken)
  }, []);

  const onSubmit = async () => {
    console.log('submit button clicked');
  };

  return (
    <Form onSubmit={onSubmit}>
      <FormSection>
        <Text>
          {context
            ? `What is going on?, ImportId = ${context.extension.importId}, WorkspaceId = ${context.extension.workspaceId}`
            : 'Lucas context... Loading...'}
        </Text>
        <Text>{data ? data : 'Lucas data... Loading...'}</Text>
        <Label labelFor="token">Token</Label>
        <Textfield name="token" id="token" isReadOnly="true" value={token ? token : 'Generating new token...'} />
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
