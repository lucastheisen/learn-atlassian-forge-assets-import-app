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
  Inline,
  Label,
  Text,
  TextArea,
  Textfield,
} from '@forge/react';
import React, { useCallback, useEffect, useState } from 'react';
import type {
  Config
} from '../resolvers/index'

const App = () => {
  const [data, setData] = useState<string | null>(null);
  const [context, setContext] = useState<FullContext | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [isEditSecretAccessKey, setEditSecretAccessKey] = useState(false);
  const [mapping, setMapping] = useState('');
  const [importData, setImportData] = useState('');

  const toggleEditSecretAccessKey = useCallback(async (editable: boolean) => {
    if (editable) {
      setSecretAccessKey("")
      setEditSecretAccessKey(true)
    }
    else {
      setSecretAccessKey("********")
      setEditSecretAccessKey(false)
    }
  }, [])

  const generateToken = async () => {
    setToken("Generating token...")
    invoke<string>('newToken').then(setToken)
  }

  const onSubmit = async () => {
    console.log('submit button clicked');
    await invoke('setConfig', {
      accessKeyId: accessKeyId,
      isEditSecretAccessKey: isEditSecretAccessKey,
      secretAccessKey: secretAccessKey,
      mapping: mapping,
      importData: importData,
    })
  };

  useEffect(() => {
    view.getContext().then(setContext);
    invoke<string>('getText', { example: 'my-invoke-variable' }).then(setData);
    invoke<Config>('getConfig')
      .then(
        (config) =>
        {
          setAccessKeyId(config.accessKeyId);
          toggleEditSecretAccessKey(!config.hasSecretAccessKey);
          setMapping(config.mapping);
          setImportData(config.importData);
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
        <Label labelFor="accessKeyId">AWS Access Key ID</Label>
        <Textfield
          name="accessKeyId"
          id="accessKeyId"
          value={accessKeyId}
          onChange={(e) => setAccessKeyId(e.target.value)}
        />

        <Label labelFor="secretAccessKey">AWS Secret Access Key</Label>
        <Inline>
          <Textfield
            id="secretAccessKey"
            isReadOnly={!isEditSecretAccessKey}
            name="secretAccessKey"
            onChange={(e) => setSecretAccessKey(e.target.value)}
            value={secretAccessKey}
          />
          <Button
            appearance="subtle"
            iconBefore={isEditSecretAccessKey ? "undo" : "edit"}
            type="button"
            onClick={(_e) => toggleEditSecretAccessKey(!isEditSecretAccessKey)}
          >
            {null}
          </Button>
        </Inline>
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
      <FormSection>
        <Label labelFor="importData">Import Data</Label>
        <TextArea
          name="importData"
          id="importData"
          value={importData}
          onChange={(e) => setImportData(e.target.value)}
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
