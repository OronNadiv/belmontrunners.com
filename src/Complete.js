import React, { Component } from 'react'
import queryString from 'query-string'
import PropTypes from 'prop-types'
import { ROOT } from './urls'
import { Redirect, withRouter } from 'react-router-dom'

class Complete extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { search } = this.props.location

    const parsed = queryString.parse(search) || {}
    const { action, oobCode } = parsed

    let redirect
    if (action) {
      const to = `/${action}?oobCode=${oobCode}`
      redirect = <Redirect to={to} />
    } else {
      redirect = <Redirect to={ROOT} />
    }

    this.setState({ redirect })
  }

  render () {
    return this.state.redirect || ''
  }
}

Complete.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired
  }).isRequired
}

export default withRouter(Complete)
