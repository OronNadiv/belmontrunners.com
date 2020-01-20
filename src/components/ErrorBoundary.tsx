import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import * as PropTypes from 'prop-types'

class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    this.setState({ hasError: true })
    Sentry.captureException(err)
  }

  render() {
    return this.props.children
  }
}

// @ts-ignore
ErrorBoundary.propTypes = {
  children: PropTypes.element.isRequired
}

export default ErrorBoundary
