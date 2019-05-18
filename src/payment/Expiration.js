import React, { Component } from 'react'
import MaskedInput from 'react-text-mask'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField/index'

function TextMaskCustom (props) {
  const { inputRef, ...other } = props

  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null)
      }}
      mask={[/[0-1]/, /\d/, ' ', '/', ' ', /[1-2]/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  )
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired
}

class Expiration extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value.replace(/\s/g, '')
    })
  }

  render () {
    const { textmask } = this.state
    const { value, onChange } = this.props

    return (
      <TextField
        fullWidth
        margin="normal"
        style={{ width: 60 }}
        label="Expiration&nbsp;MM/YY"
        // value={textmask}
        value={value}
        // onChange={this.handleChange('textmask')}
        onChange={onChange}
        id="formatted-numberformat-input"
        InputProps={{
          inputComponent: TextMaskCustom
        }}
        error={!!this.state.invalidExpMessage}
        helperText={this.state.invalidExpMessage}

      />
    )
  }
}

export default Expiration