import React, { Component } from 'react'
import { Select, TextField } from 'final-form-material-ui'
import * as PropTypes from 'prop-types'
import moment from 'moment'
import { Field, Form } from 'react-final-form'
import MenuItem from '@material-ui/core/MenuItem'
import SignUpStepperButton from './SignUpStepperButton'
import LoggedInState from '../HOC/LoggedInState'
import { connect } from 'react-redux'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  GENDER,
  PHONE,
  SHIRT_GENDER,
  SHIRT_SIZE,
  STATE,
  ZIP
} from '../../fields'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'

const states = require('./states_titlecase.json')
const required = value => (value ? undefined : 'Required')
const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined)
const MAX_YEAR = moment().year() - 5
const MIN_YEAR = moment().year() - 120
const birthday = value => {
  const val = moment(value, 'YYYY-MM-DD')
  return val.year() < MIN_YEAR || val.year() > MAX_YEAR ? 'Invalid birthday' : undefined
}
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)

class SignUpStepUserProfile extends Component {
  handleSubmit (values) {
    const { updateUserData } = this.props
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    return updateUserData(values, { merge: true })
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.userDataUpdating && !this.props.userDataUpdating) {
      if (!this.props.userDataUpdateError) {
        const { onNextClicked } = this.props
        onNextClicked()
      } else {
        // todo: show error since update failed.
      }
    }
  }

  render () {
    const { isLast, userData, isCurrentUserLoaded, userDataUpdating } = this.props

    return !isCurrentUserLoaded ?
      <div className="loading" /> :
      <Form
        onSubmit={(values) => this.handleSubmit(values)}
        initialValues={userData}
        render={({ handleSubmit, form, values }) => (
          <form onSubmit={handleSubmit} className='container-fluid'>
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

            <div className='row'>
              <div style={{ margin: '16px 0 8px' }}>
                <Field
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
            </div>

            <div className='row d-flex justify-content-between align-items-end'>
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
                component={TextField}
                validate={composeValidators(required, birthday)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </div>

            <div className='row'>
              <div style={{ margin: '16px 0 8px' }}>
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
            </div>

            <div className='row mx-auto mt-2'>
              <div className='text-center'>
                Each member receives the Belmont Runners official<a
                target='_blank' rel='noopener noreferrer'
                href={`https://www.belmontrunners.com/documents/running-shirt.png`}> Running Shirt</a>
              </div>
            </div>

            <div className='row d-flex justify-content-between'>
              <div style={{ margin: '16px 0 8px' }}>
                <Field
                  className='mr-4'
                  style={{ minWidth: 100 }}
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
              </div>

              <div style={{ margin: '16px 0 8px' }}>
                <Field
                  style={{ minWidth: 100 }}
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

            <SignUpStepperButton
              handlePrimaryClicked={() => form.submit()}
              primaryText={isLast ? 'Save' : 'Next'}
              primaryDisabled={!!userDataUpdating}
              showPrimary
            />
          </form>
        )}
      />
  }
}

SignUpStepUserProfile.propTypes = {
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object,
  isCurrentUserLoaded: PropTypes.bool.isRequired,

  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, userData, userDataUpdating, userDataUpdateError } }) => {
  return {
    isCurrentUserLoaded,
    userData,
    userDataUpdating,
    userDataUpdateError
  }
}

export default LoggedInState({
  name: 'SignUpStepUserProfile',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(SignUpStepUserProfile))
