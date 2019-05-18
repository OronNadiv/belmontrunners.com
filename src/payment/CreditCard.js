import React, { Component } from 'react'
import MaskedInput from 'react-text-mask'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField/index'

function TextMaskCustom (props) {
  const { inputRef, ...other } = props
  console.log('other', other)
  return (
    <MaskedInput
      {...other}
      ref={ref => {
        inputRef(ref ? ref.inputElement : null)
      }}
      mask={[/\d/, /\d/, /\d/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, /\d/, ' ', '-', ' ', /\d/, /\d/, /\d/, /\d/]}
      placeholderChar={'\u2000'}
      showMask
    />
  )
}

TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired
}

class CreditCard extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // textmask: '    -    -    -    '
    }
  }

  handleChange = name => event => {
    let value = event.target.value.replace(/\s/g, '')
    this.setState({
      [name]: value
    })
    this.props.onChange({ target: { value } })
  }

  render () {
    // const { textmask } = this.state
    const { value, onChange } = this.props

    return (
      <div>
        <TextField
          fullWidth
          margin="normal"
          style={{ width: 185 }}
          label="Credit Card"
          // value={textmask}
          value={value}
          // onChange={this.handleChange('textmask')}
          onChange={onChange}
          id="formatted-numberformat-input"
          InputProps={{
            inputComponent: TextMaskCustom
          }}
          error={!!this.state.invalidCCMessage}
          helperText={this.state.invalidCCMessage}
        />
      </div>
    )
  }
}

export default CreditCard