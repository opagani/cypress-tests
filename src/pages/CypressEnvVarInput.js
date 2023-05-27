import React, { useState } from "react";
import {
  ToggleButtonGroup,
  ToggleButton,
  FormField,
  Label,
  FormHelp,
  LabeledControl,
  Checkbox,
} from "@zillow/constellation";

const CypressEnvVarInput = ({
  inputConfig,
  onChangeHandler,
  cypressEnvVars,
}) => {
  if (inputConfig.type === "multiple-select") {
    return (
      <FormField
        label={<Label>{inputConfig.key}:</Label>}
        control={
          <ToggleButtonGroup
            value={cypressEnvVars[inputConfig.key]}
            onChange={(value) => onChangeHandler([inputConfig.key, value])}
            aria-label="Controlled toggle button group example"
          >
            {inputConfig.options.map((option) => (
              <ToggleButton key={option} value={option}>{option}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
        description={
          inputConfig.description && (
            <FormHelp>{inputConfig.description}</FormHelp>
          )
        }
      />
    );
  }

  if (inputConfig.type === "checkbox") {
    const checked = cypressEnvVars[inputConfig.key];

    return (
      <FormField
        label={<Label>{inputConfig.key}:</Label>}
        description={
          inputConfig.description && (
            <FormHelp>{inputConfig.description}</FormHelp>
          )
        }
      >
        <LabeledControl
          label={<Label>Enabled</Label>}
          control={
            <Checkbox
              checked={checked}
              onChange={() => onChangeHandler([inputConfig.key, !checked])}
            />
          }
        />
      </FormField>
    );
  }

  return null;
};

export default CypressEnvVarInput;
