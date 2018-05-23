import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { groupBy } from 'lodash';

class Dropdown extends React.Component {

  getOptions(options) {    
    return options.map(o => ({
      value: o.id,
      label: o.title,
      type: o.type,
    }));
  }

  render() {
    const { onChange, options, groupByProp } = this.props;
    let finalOptions = this.getOptions(options);

    if(groupByProp) {
      const grouped = groupBy(options, groupByProp);
      finalOptions = Object.entries(grouped).map(([type, result]) => ({
        label: type,
        options: this.getOptions(result)
      }));
    }

    return (
      <Select
        onChange={selected => onChange(selected.value)}
        options={finalOptions}
      />
    );
  }
}

const option = PropTypes.shape({
  type: PropTypes.string.isRequired,
  id: PropTypes.string,
  title: PropTypes.string,
});

Dropdown.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(option).isRequired,
  groupByProp: PropTypes.string
};

export default Dropdown;
