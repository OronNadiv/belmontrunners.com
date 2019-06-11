import React, { Component } from 'react'
import { Select, TextField } from 'final-form-material-ui'
import * as PropTypes from 'prop-types'
import moment from 'moment'
import { Field } from 'react-final-form'
import MenuItem from '@material-ui/core/MenuItem'
import { ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, SHIRT_GENDER, SHIRT_SIZE, STATE, ZIP } from '../fields'
// import { DatePicker, MuiPickersUtilsProvider } from "material-ui-pickers"
// import MomentUtils from '@date-io/moment'
import _ from 'underscore'
import DatePickerWrapper from './DatePickerWrapper'

const states = require('./states_titlecase.json')
const required = value => (value ? undefined : 'Required')
const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined)
const MAX_YEAR = moment().year() - 5
const MIN_YEAR = moment().year() - 120
const birthday = value => {
  const val = moment(value, 'YYYY-MM-DD')
  return !val.isValid() || val.year() < MIN_YEAR || val.year() > MAX_YEAR ? 'Invalid birthday' : undefined
}
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)

class UserDetails extends Component {
  render () {
    let { values } = this.props

    values = _.pick(values, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, SHIRT_GENDER, SHIRT_SIZE, STATE, ZIP)
    return (
      <div className='container-fluid'>
        <div className='row'>
          <Field
            label='Address 1'
            fullWidth
            margin='normal'
            name={ADDRESS1}
            component={TextField}
            validate={required}
          />
        </div>

        <div className='row'>
          <Field
            label='Address 2'
            fullWidth
            margin='normal'
            name={ADDRESS2}
            component={TextField}
            format={(value) => value || ''} // to field
            parse={(value) => value || null}// to json
          />
        </div>

        <div className='row d-flex justify-content-between align-content-center'>
          <Field
            label='City'
            margin='normal'
            name={CITY}
            component={TextField}
            validate={required}
          />
          <Field
            style={{ width: 100 }}
            name={ZIP}
            component={TextField}
            validate={composeValidators(required, mustBeNumber)}
            label='Zip'
            margin='normal'
          />
        </div>

        <div className='row mt-2 mb-1'>
          <Field
            style={{ width: 120 }}
            name={STATE}
            component={Select}
            validate={required}
            label='State'
            // margin='normal'
            initialValue='CA'
            width='auto'
          >
            {
              states.map(
                ({ abbreviation, name }, key) =>
                  <MenuItem key={key} value={abbreviation}>{name}</MenuItem>
              )
            }
          </Field>
        </div>

        <div className='row d-flex justify-content-between align-items-end mt-2 mb-1'>
          <Field
            style={{ width: 120 }}
            name={PHONE}
            component={TextField}
            validate={required}
            type='tel'
            label='Phone'
            margin='normal'
            InputLabelProps={{
              shrink: true
            }}
          />
          <Field
            style={{ width: 150 }}
            label='Birthday'
            margin='normal'
            name={DATE_OF_BIRTH}
            type='date'
            component={DatePickerWrapper}
            disableFuture
            openTo="year"
            views={['year', 'month', 'day']}
            validate={composeValidators(required, birthday)}
            emptyLabel={''}
            format={value => { // to field
              if (!value) {
                return null
              }
              const res = moment(value, "YYYY-MM-DD")
              console.log('format', value, res)
              return res
            }}
            parse={value => { // to json
              const res = value.format("YYYY-MM-DD")
              console.log('parse', value, res)
              return res
            }}
            InputLabelProps={{
              shrink: true
            }}
          />
        </div>

        <div className='row mt-2 mb-1'>
          <Field
            style={{ minWidth: 120 }}
            name={GENDER}
            component={Select}
            validate={required}
            label='Gender'
            // margin='normal'
            width='auto'
          >
            <MenuItem value={'F'}>Female</MenuItem>
            <MenuItem value={'M'}>Male</MenuItem>
            <MenuItem value={'O'}>Other</MenuItem>
          </Field>
        </div>

        <div className='row mx-auto mt-2 mb-2'>
          <div className='text-center'>
            Each member receives the Belmont Runners official<a
            target='_blank' rel='noopener noreferrer'
            href={`https://www.belmontrunners.com/documents/running-shirt.png`}> Running Shirt</a>
          </div>
        </div>

        <div className='row d-flex justify-content-between mt-2 mb-1'>
          <Field
            style={{ minWidth: 120 }}
            name={SHIRT_GENDER}
            component={Select}
            validate={required}
            label='Shirt gender'
            // margin='normal'
            width='auto'
          >
            <MenuItem value={'F'}>Female</MenuItem>
            <MenuItem value={'M'}>Male</MenuItem>
          </Field>

          <Field
            style={{ minWidth: 150 }}
            name={SHIRT_SIZE}
            component={Select}
            validate={required}
            label='Shirt size'
            // margin='normal'
            width='auto'
          >
            {values.shirtGender === 'F' && <MenuItem value={'XS'}>X-Small</MenuItem>}
            <MenuItem value={'S'}>Small</MenuItem>
            <MenuItem value={'M'}>Medium</MenuItem>
            <MenuItem value={'L'}>Large</MenuItem>
            <MenuItem value={'XL'}>X-Large</MenuItem>
          </Field>
        </div>
      </div>
    )
  }
}

UserDetails.propTypes = {
  values: PropTypes.object.isRequired
}

export default UserDetails
