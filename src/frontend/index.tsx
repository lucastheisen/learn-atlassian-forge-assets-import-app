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
  SectionMessage,
  Text,
  TextArea,
  Textfield,
} from '@forge/react';
import React, { useEffect, useState } from 'react';
import type {
  Config
} from '../resolvers/index'
import { type BuildInfo, buildInfo } from '../version';

const App = () => {
  const [backendBuild, setBackendBuild] = useState<BuildInfo | null>(null);
  const [buildError, setBuildError] = useState(false);
  const [context, setContext] = useState<FullContext | null>(null);

  const [mapping, setMapping] = useState('');

  const onSubmit = async () => {
    await invoke('setConfig', {
      mapping: mapping,
    })
  };

  useEffect(() => {
    invoke<BuildInfo>('getBuildInfo').then(setBackendBuild).catch(() => setBuildError(true));
    view.getContext().then(setContext);
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
        <Text>App version: {buildInfo.version}</Text>
        <Text>UI build: {buildInfo.buildId}</Text>
        <Text>Backend build: {backendBuild?.buildId ?? (buildError ? 'Unavailable' : 'Loading...')}</Text>
        {buildError && (
          <SectionMessage appearance="error">
            <Text>Unable to verify the backend build. Refresh this page to try again.</Text>
          </SectionMessage>
        )}
        {backendBuild && backendBuild.buildId !== buildInfo.buildId && (
          <SectionMessage appearance="warning">
            <Text>The UI and backend builds differ. Refresh this page and check the deployment.</Text>
          </SectionMessage>
        )}
      </FormSection>
      <FormSection>
        <Label labelFor="workspaceId">Workspace ID</Label>
        <Textfield
          name="workspaceId"
          id="workspaceId"
          isReadOnly={true}
          value={context?.extension.workspaceId ?? ''}
        />
        <Label labelFor="importId">Import ID</Label>
        <Textfield
          name="importId"
          id="importId"
          isReadOnly={true}
          value={context?.extension.importId ?? ''}
        />
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
