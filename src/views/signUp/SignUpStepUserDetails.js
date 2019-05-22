import React, { Component } from 'react'
import { Select, TextField } from 'final-form-material-ui'
import Promise from 'bluebird'
import * as PropTypes from 'prop-types'
import "firebase/firestore"
import firebase from 'firebase'

import { Field, Form } from 'react-final-form'
import MenuItem from '@material-ui/core/MenuItem'
import SignUpStepperButton from './SignUpStepperButton'

const states = require('./states_titlecase.json')
const required = value => (value ? undefined : 'Required')
const mustBeNumber = value => (isNaN(value) ? 'Must be a number' : undefined)
const minValue = min => value =>
  isNaN(value) || value >= min ? undefined : `Should be greater than ${min}`
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)

class View extends Component {
  constructor (props) {
    super(props)
    this.state = {
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      gender: '',
      dateOfBirth: '',
      shirtSizeGender: '',
      shirtSize: '' // XXS XS S M L XL XXL
    }
  }

  handleSubmit (values) {
    const { onNextClicked } = this.props
    console.log('submitting values:', values)
    return Promise
      .try(() => {
        console.log(JSON.stringify(values, 0, 2))
        this.setState({ submitting: true })
        const currentUser = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
        return currentUser.set(values)
      })
      .then((res) => {
        console.log('res', res)
        onNextClicked()
      })
      .catch(() => {
        this.setState({ submitting: false })
      })
  }

  render () {
    const {
      isLast
    } = this.props

    return (
      <Form
        className="container"
        onSubmit={(values) => this.handleSubmit(values)}
        render={({ handleSubmit, form, submitting, pristine, values }) => (
          <form onSubmit={handleSubmit}>
            <div className='row'>
              <Field
                style={{ minHeight: 68 }}
                label="Address 1"
                fullWidth
                margin="normal"
                name="address1"
                component={TextField}
                validate={required}
              />
            </div>

            <div className='row'>
              <Field
                style={{ minHeight: 68 }}
                label="Address 2"
                fullWidth
                margin="normal"
                name="address2"
                component={TextField}
              />
            </div>

            <div className='row'>
              <Field
                style={{ minHeight: 68 }}
                label="City"
                margin="normal"
                name="city"
                component={TextField}
                validate={required}
              />
            </div>

            <div className='row'>
              <Field
                // style={{ minWidth: 180 }}
                name="state"
                component={Select}
                validate={required}
                label="State"
                // margin="normal"
                initialValue="CA"
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

            <div className='row'>
              <Field
                // style={{ minWidth: 180 }}
                name="zip"
                component={TextField}
                validate={composeValidators(required, mustBeNumber)}
                label="Zip"
                margin="normal"
              />
            </div>

            <div className='row'>
              <Field
                // style={{ minWidth: 180 }}
                name="phone"
                component={TextField}
                validate={required}
                label="Phone"
                margin="normal"
              />
            </div>

            <div className='row'>
              <Field
                style={{ minWidth: 180 }}
                name="gender"
                component={Select}
                validate={composeValidators(required)}
                label="Gender"
                // margin="normal"
                width='auto'
              >
                <MenuItem value={'F'}>Female</MenuItem>
                <MenuItem value={'M'}>Male</MenuItem>
                <MenuItem value={'O'}>Other</MenuItem>
              </Field>
            </div>

            <div className='row' style={{ minHeight: 68 }}>
              <Field
                label="Birthday"
                margin="normal"
                name="dateOfBirth"
                type="date"
                component={TextField}
                validate={required}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </div>

            <div className='row'>
              <Field
                style={{ minWidth: 180 }}
                name="shirtSizeGender"
                component={Select}
                validate={composeValidators(required)}
                label="Shirt size gender"
                // margin="normal"
                width='auto'
              >
                <MenuItem value={'F'}>Female</MenuItem>
                <MenuItem value={'M'}>Male</MenuItem>
              </Field>
            </div>

            <div className='row'>
              <Field
                style={{ minWidth: 100 }}
                name="shirtSize"
                component={Select}
                validate={composeValidators(required)}
                label="Shirt size"
                // margin="normal"
                width='auto'
              >
                <MenuItem value={'XXS'}>XX-Small</MenuItem>
                <MenuItem value={'XS'}>X-Small</MenuItem>
                <MenuItem value={'S'}>Small</MenuItem>
                <MenuItem value={'M'}>Medium</MenuItem>
                <MenuItem value={'L'}>Large</MenuItem>
                <MenuItem value={'XL'}>X-Large</MenuItem>
                <MenuItem value={'XXL'}>XX-Large</MenuItem>
              </Field>
            </div>

            <pre>{JSON.stringify(values, 0, 2)}</pre>
            <SignUpStepperButton
              isLast={isLast}
              onNextClicked={() => form.submit()}
              disabled={this.state.submitting}
            />
          </form>
        )}
      />
    )
  }
}

View.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default View
