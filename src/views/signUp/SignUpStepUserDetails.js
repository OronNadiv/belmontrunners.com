import 'firebase/auth'
import 'firebase/firestore'
import firebase from 'firebase'
import React, { Component } from 'react'
import { Select, TextField } from 'final-form-material-ui'
import Promise from 'bluebird'
import * as PropTypes from 'prop-types'
import moment from 'moment'
import { Field, Form } from 'react-final-form'
import MenuItem from '@material-ui/core/MenuItem'
import SignUpStepperButton from './SignUpStepperButton'
import LoggedInState from '../HOC/LoggedInState'

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

class SignUpStepUserDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  handleSubmit (values) {
    const { onNextClicked } = this.props
    console.log('submitting values:', values)
    return Promise
      .try(() => {
        console.log(JSON.stringify(values, 0, 2))
        this.setState({ submitting: true })
        const currentUserRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
        return currentUserRef.set(values, { merge: true })
      })
      .then((res) => {
        console.log('res', res)
        onNextClicked()
      })
      .catch((err) => {
        console.log('caught an exception', err)
        this.setState({ submitting: false })
      })
  }


  componentDidMount () {
    this.setState({ loading: true })
    const currentUser = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
    currentUser.get().then(values => {
      console.log('values:', values.data())
      this.setState({ data: values.data() })
      this.setState({ loading: false, loaded: true })
    })
      .finally(() => {
        this.setState({ loading: false })
      })
  }


  render () {
    const {
      isLast
    } = this.props

    //todo: load values if exist in DB.

    return this.state.loading || !this.state.loaded ?
      <div className="loading" /> :
      <Form
        className='container-fluid'
        onSubmit={(values) => this.handleSubmit(values)}
        initialValues={this.state.data}
        render={({ handleSubmit, form, values }) => (
          <form onSubmit={handleSubmit}>
            <div className='row'>
              <Field
                style={{ minHeight: 68 }}
                label='Address 1'
                fullWidth
                margin='normal'
                name='address1'
                component={TextField}
                validate={required}
              />
            </div>

            <div className='row'>
              <Field
                style={{ minHeight: 68 }}
                label='Address 2'
                fullWidth
                margin='normal'
                name='address2'
                component={TextField}
              />
            </div>

            <div className='row d-flex justify-content-between align-content-center'>
              <Field
                style={{ minHeight: 68 }}
                label='City'
                margin='normal'
                name='city'
                component={TextField}
                validate={required}
              />

              <Field
                style={{ width: 100 }}
                name='zip'
                component={TextField}
                validate={composeValidators(required, mustBeNumber)}
                label='Zip'
                margin='normal'
              />
            </div>

            <div className='row'>
              <Field
                // style={{ minWidth: 180 }}
                name='state'
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

            <div className='row d-flex justify-content-between align-items-end'>
              <Field
                style={{ width: 120 }}
                name='phone'
                component={TextField}
                validate={required}
                label='Phone'
                margin='normal'
                InputLabelProps={{
                  shrink: true
                }}
              />
              <Field
                style={{ width: 140 }}
                label='Birthday'
                margin='normal'
                name='dateOfBirth'
                type='date'
                component={TextField}
                validate={composeValidators(required, birthday)}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </div>

            <div className='row' style={{ minHeight: 92 }}>
              <Field
                style={{ minWidth: 120 }}
                name='gender'
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

            <div className='row d-flex justify-content-between align-content-center' style={{ minHeight: 92 }}>
              <Field
                style={{ minWidth: 180 }}
                name='shirtSizeGender'
                component={Select}
                validate={required}
                label='Shirt size gender'
                // margin='normal'
                width='auto'
              >
                <MenuItem value={'F'}>Female</MenuItem>
                <MenuItem value={'M'}>Male</MenuItem>
              </Field>

              <Field
                style={{ minWidth: 100 }}
                name='shirtSize'
                component={Select}
                validate={required}
                label='Shirt size'
                // margin='normal'
                width='auto'
              >
                {values.shirtSizeGender === 'F' && <MenuItem value={'S'}>Small</MenuItem>}
                <MenuItem value={'M'}>Medium</MenuItem>
                <MenuItem value={'L'}>Large</MenuItem>
                <MenuItem value={'XL'}>X-Large</MenuItem>
              </Field>
            </div>

            <SignUpStepperButton
              isLast={!!isLast}
              onNextClicked={() => form.submit()}
              disabled={!!this.state.submitting}
            />
          </form>
        )}
      />
  }
}

SignUpStepUserDetails.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default LoggedInState({ name: 'SignUpStepUserDetails', isRequiredToBeLoggedIn: true })(SignUpStepUserDetails)
