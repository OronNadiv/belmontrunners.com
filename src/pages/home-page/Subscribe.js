import React, { Component } from 'react'
import rp from 'request-promise'
import isEmail from 'isemail'
import * as Sentry from '@sentry/browser'
import 'firebase/auth'
import firebase from 'firebase'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

class Footer extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      isSubmitting: false,
      message: '',
      messageLevel: '',
      placeholder: 'Your email address'
    }
  }

  componentDidMount () {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(this.recaptcha, {
      size: 'invisible',
      callback: (response) => {
        console.log('captcha succeeded.', response)
        this.notRobot = true
        window.recaptchaVerifier.clear()
        this.subscribe()
      },
      'expired-callback': () => {
        console.log('captcha failed.')
        this.setState({ captchaFailed: true })
      }
    })
    window.recaptchaVerifier.render().then((widgetId) => {
      window.recaptchaWidgetId = widgetId
    })
  }

  async subscribe (e) {
    e && e.preventDefault()
    if (this.state.isSubmitting) {
      return
    }
    if (!this.state.email || !this.state.email.trim()) {
      this.setState({
        message: 'Please enter a valid email address.',
        messageLevel: 'alert-warning'
      })
      return
    }
    if (!isEmail.validate(this.state.email)) {
      this.setState({
        message: 'You have entered an invalid e-mail address. Please try again.',
        messageLevel: 'alert-warning'
      })
      return
    }

    this.setState({
      isSubmitting: true,
      message: 'Submitting...',
      messageLevel: 'alert-info'
    })
    try {
      await rp({
        method: 'POST',
        uri: 'https://c0belq1th0.execute-api.us-west-1.amazonaws.com/default/contact',
        body: {
          name: this.state.email,
          email: this.state.email,
          subject: 'Subscription request',
          comments: `Please subscribe me to the weekly emails from the Belmont Runners club.
My email address is: ${this.state.email}`
        },
        json: true
      })
      this.setState({
        email: '',
        message: 'Subscription complete successfully.',
        messageLevel: 'alert-success'
      })
      setTimeout(() => {
        this.setState({
          message: '',
          messageLevel: ''
        })
      }, 5000)
    } catch (error) {
      Sentry.captureException(error)
      console.error('error response:', error)
      this.setState({
        message: 'Oops, something went wrong.  Please try again later.',
        messageLevel: 'alert-danger'
      })
    } finally {
      this.setState({
        isSubmitting: false
      })
    }
  }

  render () {
    return (
      <section className='subscribe_area pad_btm'>
        <div className='container'>
          <div className='main_title'>
            <h2>Weekly email</h2>
          </div>
          <div className='row'>
            <div className='col-lg-5 col-md-6 col-sm-6 mx-auto'>
              <div className='single-footer-widget'>
                <p className='text-center'>Get updates about runs, walks and other events.</p>
                <div id='mc_embed_signup'>
                  <div className='subscribe_form relative'>
                    <div className='input-group d-flex flex-row'>
                      <input name='EMAIL' placeholder={this.state.placeholder}
                             onFocus={() => this.setState({ placeholder: '' })}
                             onBlur={() => this.setState({ placeholder: 'Email Address' })}
                             required type='email'
                             onChange={(event) => this.setState({ email: event.target.value })}
                             value={this.state.email}>

                      </input>
                      <button className='btn sub-btn' disabled={this.state.isSubmitting}
                              ref={(ref) => this.recaptcha = ref}
                              onClick={(e) => this.notRobot && this.subscribe(e)}>
                        Subscribe
                      </button>
                    </div>
                    <div role='alert' className={'mt-10 alert ' + this.state.messageLevel}>{this.state.message}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          this.state.captchaFailed &&
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            open
            autoHideDuration={6000}
            onClose={() => {
              console.log('onClose')
              this.setState({ captchaFailed: false })
            }}
            message={"Submission failed."}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => {
                  console.log('onClick')
                  this.setState({ captchaFailed: false })
                }}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
        }
      </section>
    )
  }
}

export default Footer