const PREFIX = 'PAYMENT'

export const SUBMIT_PAYMENT_START = `${PREFIX}_SUBMIT_PAYMENT_START`
export const SUBMIT_PAYMENT_SUCCEEDED = `${PREFIX}_SUBMIT_PAYMENT_SUCCEEDED`
export const SUBMIT_PAYMENT_FAILED = `${PREFIX}_SUBMIT_PAYMENT_FAILED`

export const submitPayment = ({ stripe, name, cc, expiration: { month, year }, zip }) => {
  return (dispatch) => {
    dispatch({
      type: SUBMIT_PAYMENT_START
    })

    setTimeout(() => {
      dispatch({
        type: SUBMIT_PAYMENT_SUCCEEDED
      })
    }, 1)
  }
}
