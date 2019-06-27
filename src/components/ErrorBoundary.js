import { Component } from 'react'
import * as Sentry from '@sentry/browser'
import * as PropTypes from 'prop-types'

class ErrorBoundary extends Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false }
  }

  componentDidCatch (err, info) {
    this.setState({ hasError: true })
    Sentry.captureException(err)
  }

  render () {
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.element.isRequired
}

export default ErrorBoundary
