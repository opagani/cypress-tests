import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Text,
  Page,
  PageContent,
  Heading,
  Paragraph,
  Form,
  Spacer,
  Anchor,
  withToast,
  Toast,
  TextButton,
} from '@zillow/constellation';

import cypressFiles from "../data/cypressFiles.json";
import cypressEnvVarInputsConfig from "../utils/cypressEnvVarInputsConfig";
import CypressEnvVarInput from "./CypressEnvVarInput";

const formatCypressEnvVars = (envVars) => {
  return Object.entries(envVars).map(([key, value]) => `${key}=${value}`).join(',');
}

const TriggerTestPage = ({ enqueueToast }) => {
  const [pipelineUrl, setPipelineUrl] = useState(null);
  const [disableRunButtons, setDisableRunButtons] = useState(false);
  const [cypressEnvVars, setCypressEnvVars] = useState({});

  const handleTestTrigger = (filePath) => {
    setDisableRunButtons(true);

    const formattedCypressEnvVars = formatCypressEnvVars(cypressEnvVars);
    const envArguments = formattedCypressEnvVars ? `--env ${formattedCypressEnvVars}` : '';

    var bodyFormData = new FormData();
    bodyFormData.append('token', 'f81b2908f47560c9bdbffcc753673d');
    bodyFormData.append('ref', 'main');
    bodyFormData.append('variables[CYPRESS_OPTIONS]', `--spec ${filePath} ${envArguments}`);

    axios({
      method: "post",
      url: "https://gitlab.zgtools.net/api/v4/projects/37252/trigger/pipeline",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => {
      setPipelineUrl(res.data['web_url']);
      setDisableRunButtons(false);
      enqueueToast(<Toast
        appearance="success"
        body="Test triggered successfully"
        actionButton={<TextButton as="a" href={res.data['web_url']} target="_blank">Open</TextButton>}
      />)
    }).catch(e => {
      console.error(e);
      enqueueToast(<Toast appearance="warning" body="Test triggered unsuccessfully. Please try again later" />)
    });
  };

  const onChangeHandler = ([key, value]) => {
    setCypressEnvVars({...cypressEnvVars, [key]: value})
  }

  return (
    <Page>
      <PageContent>
        <Heading level={3}>Rental Protection Tests</Heading>
        <Paragraph>View All Pipelines: <a target="_blank" href="https://gitlab.zgtools.net/zillow/dragon-phoenix/rental-protection-tests/-/pipelines">https://gitlab.zgtools.net/zillow/dragon-phoenix/rental-protection-tests/-/pipelines</a></Paragraph>
        { pipelineUrl && <Paragraph>Last Pipeline Triggered: <Anchor target="_blank" href={pipelineUrl}>{pipelineUrl}</Anchor></Paragraph> }
        <Spacer marginY="sm">
          <Form onSubmit={e => e.preventDefault()}>
            <Heading level={4}>Cypress Environment Variables</Heading>
              {cypressEnvVarInputsConfig.map(inputConfig =>
                <CypressEnvVarInput
                  key={inputConfig.key}
                  cypressEnvVars={cypressEnvVars}
                  inputConfig={inputConfig}
                  onChangeHandler={onChangeHandler}
                />)}
          </Form>
        </Spacer>
        <Heading level={4} marginBottom="xs">Available Tests</Heading>
        <div>
          {cypressFiles.map((filePath) => {
            return (
              <div key={filePath}>
                <Button
                  size="sm"
                  buttonType="primary"
                  marginBottom={0.5}
                  disabled={disableRunButtons}
                  onClick={() => handleTestTrigger(filePath)}
                >
                  Run
                </Button>{" "}
                <Text fontType="bodySmall">{filePath}</Text>
              </div>
            );
          })}
        </div>
      </PageContent>
    </Page>
  );
};

export default withToast(TriggerTestPage);
