import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  FieldContainer,
  FieldLabel,
  FieldInput,
} from '@keystonejs/ui/src/primitives/fields';
// TODO: Upload component?
import { HiddenInput } from '@keystonejs/ui/src/primitives/forms';
import { LoadingButton } from '@keystonejs/ui/src/primitives/buttons';
import { borderRadius, colors, gridSize } from '@keystonejs/ui/src/theme';

function buttonLabelFn({ hasValue }) {
  return hasValue ? 'Change Image' : 'Upload Image';
}

export default class FileField extends Component {
  static propTypes = {
    buttonLabel: PropTypes.func,
    disabled: PropTypes.bool,
    field: PropTypes.object,
    onChange: PropTypes.func,
  };
  static defaultProps = {
    buttonLabel: buttonLabelFn,
  };
  state = {
    dataURI: null,
    errorMessage: false,
    isLoading: false,
  };

  onChange = ({
    target: {
      validity,
      files: [file],
    },
  }) => {
    if (!file) return; // bail if the user cancels from the file browser

    const { field, onChange } = this.props;

    // basic validity check
    if (!validity.valid) {
      this.setState({
        errorMessage: 'Something went wrong, please reload and try again.',
      });
      return;
    }

    // check if the file is actually an image
    if (!file.type.includes('image')) {
      this.setState({
        errorMessage: 'Only image files are allowed. Please try again.',
      });
      return;
    } else if (this.state.errorMessage) {
      this.setState({ errorMessage: null });
    }

    onChange(field, file);
    this.getDataURI(file);
  };
  openFileBrowser = () => {
    if (this.inputRef) this.inputRef.click();
  };

  getDataURI = file => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onloadstart = () => {
      this.setState({ isLoading: true });
    };
    reader.onerror = err => {
      console.error('Error with Cloudinary preview', err);
      this.setState({
        errorMessage: 'Something went wrong, please reload and try again.',
      });
    };
    reader.onloadend = upload => {
      this.setState({ isLoading: false, dataURI: upload.target.result });
    };
  };
  getImagePath = () => {
    const { field, item } = this.props;
    const { dataURI } = this.state;
    const file = item[field.path];

    return (
      (file && file.publicUrlTransformed && file.publicUrlTransformed.url) ||
      dataURI
    );
  };
  getInputRef = ref => {
    this.inputRef = ref;
  };

  render() {
    const { autoFocus, buttonLabel, field, item } = this.props;
    const { errorMessage, isLoading } = this.state;

    const file = item[field.path];
    const imagePath = this.getImagePath();
    const button = (
      <LoadingButton
        onClick={this.openFileBrowser}
        isLoading={isLoading}
        variant="ghost"
      >
        {buttonLabel({ hasValue: imagePath })}
      </LoadingButton>
    );

    return (
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        <FieldInput>
          {imagePath ? (
            <Wrapper>
              <Image src={imagePath} alt={field.path} />
              <Content>
                <div>{button}</div>
                {errorMessage ? (
                  <ErrorInfo>{errorMessage}</ErrorInfo>
                ) : file ? (
                  <MetaInfo>{file.filename || file.name}</MetaInfo>
                ) : null}
                {}
              </Content>
            </Wrapper>
          ) : (
            button
          )}

          <HiddenInput
            autoComplete="off"
            autoFocus={autoFocus}
            innerRef={this.getInputRef}
            type="file"
            name={field.path}
            onChange={this.onChange}
          />
        </FieldInput>
      </FieldContainer>
    );
  }
}

const Wrapper = props => (
  <div css={{ alignItems: 'flex-start', display: 'flex' }} {...props} />
);
const Content = props => <div css={{ flex: 1 }} {...props} />;
const Image = props => (
  <div
    css={{
      backgroundColor: 'white',
      borderRadius,
      border: `1px solid ${colors.N20}`,
      flexShrink: 0,
      lineHeight: 0,
      marginRight: gridSize,
      width: 130,
      textAlign: 'center',
      padding: 4,
    }}
  >
    <img
      css={{
        height: 'auto',
        maxWidth: '100%',
      }}
      {...props}
    />
  </div>
);
const Info = ({ styles, ...props }) => (
  <div
    css={{
      borderRadius,
      border: '1px solid transparent',
      display: 'inline-block',
      fontSize: '0.85em',
      marginTop: gridSize,
      padding: `${gridSize / 2}px ${gridSize}px`,
      ...styles,
    }}
    {...props}
  />
);
const MetaInfo = props => (
  <Info
    styles={{
      backgroundColor: colors.N05,
      borderColor: colors.N10,
      color: colors.N60,
    }}
    {...props}
  />
);
const ErrorInfo = props => (
  <Info
    styles={{
      backgroundColor: colors.R.L90,
      borderColor: colors.R.L80,
      color: colors.R.D20,
    }}
    {...props}
  />
);
