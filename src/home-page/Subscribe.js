import React, { Component } from 'react'
import rp from 'request-promise'
import isEmail from 'isemail'

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

  subscribe (e) {
    e.preventDefault()
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
    rp({
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
      .then(() => {
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
      })
      .catch((response) => {
        console.error('error response:', response)
        this.setState({
          message: 'Oops, something went wrong.  Please try again later.',
          messageLevel: 'alert-danger'
        })
      })
      .finally(() => {
        this.setState({
          isSubmitting: false
        })
      })
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
              <div className='single-footer-widget' >
                <p className='text-center'>Get updates about runs, walks and other events.</p>
                <div id='mc_embed_signup'>
                  <form target='_blank'
                        action='https://spondonit.us12.list-manage.com/subscribe/post?u=1462626880ade1ac87bd9c93a&amp;id=92a4423d01'
                        method='get' className='subscribe_form relative'>
                    <div className='input-group d-flex flex-row'>
                      <input name='EMAIL' placeholder={this.state.placeholder}
                             onFocus={() => this.setState({ placeholder: '' })}
                             onBlur={() => this.setState({ placeholder: 'Email Address' })}
                             required type='email'
                             onChange={(event) => this.setState({ email: event.target.value })}
                             value={this.state.email}>

                      </input>
                      <button className='btn sub-btn' disabled={this.state.isSubmitting}
                              onClick={(e) => this.subscribe(e)}>Subscribe
                      </button>
                    </div>
                    <div role='alert' className={'mt-10 alert ' + this.state.messageLevel}>{this.state.message}</div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

export default Footer