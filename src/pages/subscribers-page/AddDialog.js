import React, { Component } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import { TextField } from 'final-form-material-ui'
import * as PropTypes from 'prop-types'
import isEmail from 'isemail'
import { Field, Form } from 'react-final-form'
import DialogActions from '@material-ui/core/DialogActions'

class AddDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      email: ''
    }
  }

  handleSubmit ({ email }) {
    console.log('handleSubmit called')
    const { onAdd } = this.props
    onAdd(email.trim())
  }

  render () {
    const { onCancel } = this.props

    return (
      <Dialog
        open
        fullWidth
        maxWidth='xs'
        onClose={() => onCancel()}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Add subscriber
        </DialogTitle>

        <Form
          onSubmit={(values) => this.handleSubmit(values)}
          initialValues={this.state}
          render={({ handleSubmit, form, values }) => (
            <form onSubmit={() => {
              console.log('form.handleSubmit called')
              handleSubmit()
            }}>
              <div>
                <DialogContent>
                  <Field
                    label='Email'
                    fullWidth
                    type='email'
                    margin='normal'
                    name='email'
                    component={TextField}
                    validate={(email) => {
                      console.log('val:', email)
                      const res = !email || !isEmail.validate(email) ? 'Invalid email address' : undefined
                      console.log('val:', email, 'res:', res)
                      return res
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => onCancel()}>
                    Cancel
                  </Button>

                  <Button onClick={form.submit} color="primary">
                    Add
                  </Button>
                </DialogActions>
              </div>
            </form>
          )}
        />
      </Dialog>
    )
  }
}

AddDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired
}

export default AddDialog
