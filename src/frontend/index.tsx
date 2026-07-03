import {
  type FullContext,
  invoke,
  view
} from '@forge/bridge';
import ForgeReconciler, {
  Button,
  Form,
  FormFooter,
  FormSection,
  Label,
  Text,
  TextArea,
  Textfield,
} from '@forge/react';
import React, { useEffect, useState } from 'react';
import type {
  Config
} from '../resolvers/index'

const App = () => {
  const [data, setData] = useState<string | null>(null);
  const [context, setContext] = useState<FullContext | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [mapping, setMapping] = useState('');

  const generateToken = async () => {
    setToken("Generating token...")
    invoke<string>('newToken').then(setToken)
  }

  const onSubmit = async () => {
    console.log('submit button clicked');
    await invoke('setConfig', {
      mapping: mapping,
    })
  };

  useEffect(() => {
    view.getContext().then(setContext);
    invoke<string>('getText', { example: 'my-invoke-variable' }).then(setData);
    invoke<Config>('getConfig')
      .then(
        (config) =>
        {
          setMapping(config.mapping);
        });
  }, []);

  return (
    <Form onSubmit={onSubmit}>
      <FormSection>
        <Text>
          {context
            ? `What is going on?, ImportId = ${context.extension.importId}, WorkspaceId = ${context.extension.workspaceId}`
            : 'Lucas context... Loading...'}
        </Text>
        <Text>{data || 'Lucas data... Loading...'}</Text>
      </FormSection>
      <FormSection>
        <Label labelFor="token">Token</Label>
        <Textfield
          name="token"
          id="token"
          isReadOnly={true}
          value={token ?? ""}
        />
        <Button
          appearance="subtle"
          type="button"
          onClick={generateToken}
        >
          Generate token
        </Button>
      </FormSection>
      <FormSection>
        <Label labelFor="mapping">Mapping</Label>
        <TextArea
          name="mapping"
          id="mapping"
          value={mapping}
          onChange={(e) => setMapping(e.target.value)}
        />
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
