import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import * as PropTypes from 'prop-types'
import React from 'react'

function DatePickerWrapper(props: any) {
  const {
    input: { name, onChange, value, ...restInput },
    meta,
    ...rest
  } = props
  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    meta.touched

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        {...rest}
        name={name}
        format={'YYYY-MM-DD'}
        helperText={showError ? meta.error || meta.submitError : undefined}
        error={showError}
        inputProps={restInput}
        onChange={onChange}
        value={value === '' ? null : value}
      />
    </MuiPickersUtilsProvider>
  )
}

DatePickerWrapper.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object
}

export default DatePickerWrapper
