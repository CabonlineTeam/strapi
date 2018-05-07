/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty, isFunction } from 'lodash';
import cn from 'classnames';

// Design
import Label from 'components/Label';
import InputDescription from 'components/InputDescription';
import InputErrors from 'components/InputErrors';
import InputText from 'components/InputText';
import InputSpacer from 'components/InputSpacer';
import SelectWithSort from 'components/SelectWithSort'

// Utils
import validateInput from 'utils/inputsValidations';

import styles from './styles.scss';

/* eslint-disable jsx-a11y/no-autofocus */
class InputRefs extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  state = { errors: [], hasInitialValue: false };

  componentDidMount() {
    const { value, errors } = this.props;

    // Prevent the input from displaying an error when the user enters and leaves without filling it
    if (!isEmpty(value)) {
      this.setState({ hasInitialValue: true });
    }

    // Display input error if it already has some
    if (!isEmpty(errors)) {
      this.setState({ errors });
    }
  }

  componentWillReceiveProps(nextProps) {
    // Show required error if the input's value is received after the compo is mounted
    if (!isEmpty(nextProps.value) && !this.state.hasInitialValue) {
      this.setState({ hasInitialValue: true });
    }

    // Check if errors have been updated during validations
    if (nextProps.didCheckErrors !== this.props.didCheckErrors) {
      // Remove from the state the errors that have already been set
      const errors = isEmpty(nextProps.errors) ? [] : nextProps.errors;
      this.setState({ errors });
    }
  }

  /**
   * Set the errors depending on the validations given to the input
   * @param  {Object} target
   */
  handleBlur = ({ target }) => {
    // Prevent from displaying error if the input is initially isEmpty
    if (!isEmpty(target.value) || this.state.hasInitialValue) {
      const errors = validateInput(target.value, this.props.validations);
      this.setState({ errors, hasInitialValue: true });
    }
  };

  onChange = (value) => {
    const { onChange, name } = this.props;
    const fakedEvent = {
      target: {
        value,
        name
      }
    };

    onChange(fakedEvent);
  }

  render() {
    const {
      autoFocus,
      className,
      customBootstrapClass,
      deactivateErrorHighlight,
      disabled,
      errorsClassName,
      errorsStyle,
      inputClassName,
      inputDescription,
      inputDescriptionClassName,
      inputDescriptionStyle,
      inputStyle,
      label,
      labelClassName,
      labelStyle,
      name,
      noErrorsDescription,
      onBlur,
      onChange,
      onFocus,
      placeholder,
      style,
      tabIndex,
      value
    } = this.props;
    const handleBlur = isFunction(onBlur) ? onBlur : this.handleBlur;

    let spacer = !isEmpty(inputDescription) ? <InputSpacer /> : <div />;

    if (!noErrorsDescription && !isEmpty(this.state.errors)) {
      spacer = <div />;
    }

    const arrayValue = value === '' ? [] : value
    return (
      <div
        className={cn(
          styles.containerText,
          customBootstrapClass,
          !isEmpty(className) && className
        )}
        style={style}
      >
        <Label
          className={labelClassName}
          htmlFor={name}
          message={label}
          style={labelStyle}
        />
        <SelectWithSort onChange={this.onChange} value={arrayValue}/>
        
        <InputDescription
          className={inputDescriptionClassName}
          message={inputDescription}
          style={inputDescriptionStyle}
        />
        <InputErrors
          className={errorsClassName}
          errors={(!noErrorsDescription && this.state.errors) || []}
          style={errorsStyle}
        />
        {spacer}
      </div>
    );
  }
}

InputRefs.defaultProps = {
  autoFocus: false,
  className: "",
  customBootstrapClass: "col-md-6",
  deactivateErrorHighlight: false,
  didCheckErrors: false,
  disabled: false,
  onBlur: false,
  onFocus: () => {},
  errors: [],
  errorsClassName: "",
  errorsStyle: {},
  inputClassName: "",
  inputDescription: "",
  inputDescriptionClassName: "",
  inputDescriptionStyle: {},
  inputStyle: {},
  label: "",
  labelClassName: "",
  labelStyle: {},
  noErrorsDescription: false,
  placeholder: "app.utils.placeholder.defaultMessage",
  style: {},
  tabIndex: "0",
  validations: {}
};

InputRefs.propTypes = {
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  customBootstrapClass: PropTypes.string,
  deactivateErrorHighlight: PropTypes.bool,
  didCheckErrors: PropTypes.bool,
  disabled: PropTypes.bool,
  errors: PropTypes.array,
  errorsClassName: PropTypes.string,
  errorsStyle: PropTypes.object,
  inputClassName: PropTypes.string,
  inputDescription: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      id: PropTypes.string,
      params: PropTypes.object
    })
  ]),
  inputDescriptionClassName: PropTypes.string,
  inputDescriptionStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.shape({
      id: PropTypes.string,
      params: PropTypes.object
    })
  ]),
  labelClassName: PropTypes.string,
  labelStyle: PropTypes.object,
  name: PropTypes.string.isRequired,
  noErrorsDescription: PropTypes.bool,
  onBlur: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  tabIndex: PropTypes.string,
  validations: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
};

export default InputRefs;
