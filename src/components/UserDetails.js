import React from 'react'
import { Select, TextField } from 'final-form-material-ui'
import moment from 'moment'
import { Field } from 'react-final-form'
import { MenuItem } from '@material-ui/core'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  GENDER,
  PHONE,
  STATE,
  ZIP
} from '../fields'
import DatePickerWrapper from './DatePickerWrapper'
import * as PropTypes from 'prop-types'

const states = require('./states_titlecase.json')
const required = value => (value ? undefined : 'Required')
const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined)
const MAX_YEAR = moment().year() - 5
const MIN_YEAR = moment().year() - 120
const birthday = value => {
  const val = moment(value, 'YYYY-MM-DD')
  return !val.isValid() || val.year() < MIN_YEAR || val.year() > MAX_YEAR
    ? 'Invalid birthday'
    : undefined
}
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)

function UserDetails({ showDisplayName = false }) {
  const spacer = <div style={{ flexGrow: 0, flexShrink: 0, width: 20 }} />

  return (
    <div className="container-fluid">
      {showDisplayName && (
        <div className="row">
          <Field
            label="Full name"
            fullWidth
            margin="normal"
            name={DISPLAY_NAME}
            component={TextField}
            validate={required}
          />
        </div>
      )}
      <div className="row">
        <Field
          label="Address 1"
          fullWidth
          margin="normal"
          name={ADDRESS1}
          component={TextField}
          validate={required}
        />
      </div>

      <div className="row">
        <Field
          label="Address 2"
          fullWidth
          margin="normal"
          name={ADDRESS2}
          component={TextField}
          format={value => value || ''} // to field
          parse={value => value || null} // to json
        />
      </div>

      <div className="row d-flex justify-content-between align-content-center">
        <Field
          label="City"
          margin="normal"
          name={CITY}
          component={TextField}
          validate={required}
        />
        {spacer}
        <Field
          style={{ width: 100 }}
          name={ZIP}
          component={TextField}
          validate={composeValidators(required, mustBeNumber)}
          label="Zip"
          margin="normal"
        />
      </div>

      <div className="row d-flex justify-content-between align-content-center">
        <div className="mt-3 mb-2">
          <Field
            style={{ minWidth: 120 }}
            name={STATE}
            component={Select}
            validate={required}
            label="State"
            // margin='normal'
            initialValue="CA"
            width="auto"
          >
            {states.map(({ abbreviation, name }, key) => (
              <MenuItem key={key} value={abbreviation}>
                {name}
              </MenuItem>
            ))}
          </Field>
        </div>
        {spacer}
        <div className="mt-3 mb-2">
          <Field
            style={{ width: 120 }}
            name={GENDER}
            component={Select}
            validate={required}
            label="Gender"
            // margin='normal'
            width="auto"
          >
            <MenuItem value={'F'}>Female</MenuItem>
            <MenuItem value={'M'}>Male</MenuItem>
            <MenuItem value={'O'}>Other</MenuItem>
          </Field>
        </div>
      </div>

      <div className="row d-flex justify-content-between align-items-center">
        <Field
          style={{ width: 120 }}
          name={PHONE}
          component={TextField}
          validate={required}
          type="tel"
          label="Phone"
          margin="normal"
          InputLabelProps={{
            shrink: true
          }}
        />
        {spacer}
        <Field
          style={{ width: 150 }}
          label="Birthday"
          margin="normal"
          name={DATE_OF_BIRTH}
          type="date"
          component={DatePickerWrapper}
          disableFuture
          openTo="year"
          views={['year', 'month', 'day']}
          validate={composeValidators(required, birthday)}
          emptyLabel={''}
          format={value => {
            // to field
            if (!value) {
              return null
            }
            const res = moment(value, 'YYYY-MM-DD')
            return res
          }}
          parse={value => {
            // to json
            const res = value.format('YYYY-MM-DD')
            return res
          }}
          InputLabelProps={{
            shrink: true
          }}
        />
      </div>
    </div>
  )
}

UserDetails.propTypes = {
  showDisplayName: PropTypes.bool
}

export default UserDetails
