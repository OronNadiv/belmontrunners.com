import React, { useEffect, useState } from 'react'
import isEmail from 'isemail'
import * as Sentry from '@sentry/browser'
import {functions} from '../../firebase'
import firebase from 'firebase/app'
import { IconButton, Snackbar } from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import rp from 'request-promise'

const DEFAULT_PLACE_HOLDER = 'Your email address'

const Subscribe = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageLevel, setMessageLevel] = useState('')
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACE_HOLDER)
  const [captchaFailed, setCaptchaFailed] = useState(false)
  const [notRobot, setNotRobot] = useState(true) // NOTE: setting to true disables the captcha verification.

  useEffect(() => {
    ;(async function() {
      if (!isSubmitting || !notRobot) {
        return
      }

      // we are submitting and we are not a robot.

      if (!email || !email.trim()) {
        console.warn('email is empty.')
        setMessage('Please enter a valid email address.')
        setMessageLevel('alert-warning')
        setIsSubmitting(false)
        return
      }
      if (!isEmail.validate(email)) {
        console.warn('email is invalid.')
        setMessage(
          'You have entered an invalid e-mail address. Please try again.'
        )
        setMessageLevel('alert-warning')
        setIsSubmitting(false)
        return
      }

      setMessage('Submitting...')
      setMessageLevel('alert-info')
      try {
        await rp({
          method: 'POST',
          uri:
            'https://www.oronnadiv.com/contact',
          body: {
            name: email,
            email: email,
            subject: 'Subscription request',
            comments: `Please subscribe me to the weekly emails from the Belmont Runners club.
My email address is: ${email}`
          },
          json: true
        })
        const addContact = functions.httpsCallable('addContact')

        console.log('calling addContact')
        const response = await addContact({ email })
        console.log('addContact.response:', response)

        setEmail('')
        setMessage('Subscription complete successfully.')
        setMessageLevel('alert-success')

        setTimeout(() => {
          setMessage('')
          setMessageLevel('')
        }, 5000)
      } catch (error) {
        Sentry.captureException(error)
        console.error('error response:', error)
        setMessage('Oops, something went wrong.  Please try again later.')
        setMessageLevel('alert-danger')
      } finally {
        setIsSubmitting(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, notRobot])

  const [recaptcha, setRecaptcha] = useState()
  useEffect(() => {
    const unsubscribe = () => {
      console.log('unsubscribe called.')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
      window.recaptchaWidgetId = null
    }
    if (!recaptcha || !!window.recaptchaWidgetId || notRobot) {
      console.log(
        'Not registering captcha.',
        '!recaptcha:',
        !recaptcha,
        '!!window.recaptchaWidgetId:',
        !!window.recaptchaWidgetId,
        'notRobot:',
        notRobot
      )
      return
    }
    console.log(
      'Registering recaptcha.',
      '!recaptcha:',
      !recaptcha,
      '!!window.recaptchaWidgetId:',
      !!window.recaptchaWidgetId,
      'notRobot:',
      notRobot
    )

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptcha, {
      size: 'invisible',
      callback: response => {
        console.log('captcha succeeded.', response)
        setNotRobot(true)
      },
      'expired-callback': () => {
        console.log('captcha failed.')
        setCaptchaFailed(true)
      }
    })
    window.recaptchaVerifier.render().then(widgetId => {
      window.recaptchaWidgetId = widgetId
    })
    return unsubscribe
  }, [recaptcha, notRobot])

  return (
    <section className="subscribe_area pad_btm">
      <div className="container">
        <div className="main_title">
          <h2>Weekly email</h2>
        </div>
        <div className="row">
          <div className="col-lg-5 col-md-6 col-sm-6 mx-auto">
            <div className="single-footer-widget">
              <p className="text-center">
                Get updates about runs and other events.
              </p>
              <div id="mc_embed_signup">
                <div className="subscribe_form relative">
                  <div className="input-group d-flex flex-row">
                    <input
                      name="EMAIL"
                      placeholder={placeholder}
                      onFocus={() => setPlaceholder('')}
                      onBlur={() => setPlaceholder(DEFAULT_PLACE_HOLDER)}
                      required
                      type="email"
                      onChange={event => setEmail(event.target.value)}
                      value={email}
                    />
                    <button
                      className="btn sub-btn"
                      disabled={isSubmitting}
                      ref={ref => setRecaptcha(ref)}
                      onClick={e => {
                        e && e.preventDefault()
                        setIsSubmitting(true)
                      }}
                    >
                      Subscribe
                    </button>
                  </div>
                  <div role="alert" className={'mt-10 alert ' + messageLevel}>
                    {message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {captchaFailed && (
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open
          autoHideDuration={6000}
          onClose={() => {
            console.log('onClose')
            setCaptchaFailed(false)
          }}
          message={'Submission failed.'}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => {
                console.log('onClick')
                setCaptchaFailed(false)
              }}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      )}
    </section>
  )
}

export default Subscribe
