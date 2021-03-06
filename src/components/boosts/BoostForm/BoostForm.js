import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { fetchLocations } from '../../../actions/LocationActions';

import {
  LinkTo,
  renderField,
  renderDropdownList,
  renderCheckboxField,
  DateDayPartsList,
  DayOfWeekAndTime,
  renderDateTimePicker,
  renderDatePicker
} from '../../../helpers';

class BoostForm extends Component {

  state = {fetched: false, items: []};

  componentDidMount() {
    this.handleInitialize();
	this.props.fetchLocations({limit: 500}).then((response) => { this.setState({fetched: true, items: response.items })});
  }

  handleInitialize() {
    const {
      item,
      item: {
        name, dates, start_time, with_max_budget, max_budget, end_time, boost_type, approved, location
      },
      initialize
    } = this.props;

    if (!isEmpty(item)) {
      this.setState({ with_max_budget }, () => initialize({
        name, dates, start_time, with_max_budget, max_budget, end_time, boost_type, approved, location
      }));
    }
  }

  render () {
    const { item, errorMessage, handleSubmit, onSave, locations } = this.props;
    const { with_max_budget, fetched, items } = this.state;
	console.log(item);

    return (
      <form onSubmit={handleSubmit(boost => onSave(boost))}>
        <div className="row">
          <div className="col-md-6">
            <Field name="name" component={renderField} label="Boost Name"/>
            <Field name="dates" component={DayOfWeekAndTime} label="Dates" />
			<Field
              name="location"
              valueField="objectId"
              textField="name"
              component={renderDropdownList}
              data={fetched ? locations.map(({ objectId, name }) => ({ objectId, name })): []}
              label="Location"
            />
          </div>
          <div className="col-md-6">
            <Field
              name="start_time"
              component={renderDatePicker}
              label="Start Date"
            />
            <Field
              name="with_max_budget"
              component={renderCheckboxField}
              label="Max Budget?"
              afterChange={({ target: { checked } }) => this.setState({ with_max_budget: checked })}
            />
            {with_max_budget ? null : (
              <Field
                name="end_time"
                component={renderDatePicker}
                label="End Date"
              />
            ) }
            {with_max_budget ? <Field name="max_budget" component={renderField} label="Max Budget"/> : null}
            <Field
              name="boost_type"
              valueField="value"
              textField="name"
              component={renderDropdownList}
              data={[
                {name: 'Invites Sent', value: 'invites_sent'},
                {name: 'Invites Accepted', value: 'invites_accepted'}
              ]}
              label="Boost Type"
            />
			
			<Field name="approved" component={renderCheckboxField} label="Approve"/>
          </div>
        </div>
        {errorMessage ? (
            <div className="alert alert-danger">
              <strong>Oops!</strong> {errorMessage}
            </div>
          ) : null}
        <div className="btn-group">
          <LinkTo className="btn btn-default" url="boosts">Cancel</LinkTo>
          <button action="submit" className="btn btn-primary">
            {isEmpty(item) ? 'Create Boost' : 'Update Boost'}
          </button>
        </div>
      </form>
    );
  }
}

BoostForm.defaultProps = {
  item: {}
};

BoostForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.shape({
    objectId: PropTypes.string
  })
};

function validate({ name, dates, start_time, with_max_budget, max_budget, end_time, boost_type, location }) {
  const errors = {};

  if (!name) {
    errors.name = 'Please enter a Boost Name';
  }

  if (size(dates) === 0) {
    errors.dates = 'Please select at least one date';
  }

  if (!start_time) {
    errors.start_time = 'Please select Start Time';
  }

  if (with_max_budget && !max_budget) {
    errors.max_budget = 'Please enter Max Budget';
  }

  if (!with_max_budget && !end_time) {
    errors.end_time = 'Please select End Time';
  }

  if (!boost_type) {
    errors.boost_type = 'Please select Boost Type';
  }
  
  if(!location){
	  errors.location = 'Please select a location';
  }

  return errors;
}

export default connect(({
  locations: { items: locations }
}) => ({ locations }), ({ fetchLocations })) (reduxForm({ form: 'boost', validate })(BoostForm));