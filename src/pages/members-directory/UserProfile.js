import * as PropTypes from 'prop-types'
import React from 'react'
import Avatar from 'react-avatar'
import moment from 'moment'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  PHONE,
  PHOTO_URL,
  STATE,
  ZIP
} from '../../fields'
import googleLibPhoneNumber from 'google-libphonenumber'
import CloseIcon from '@material-ui/icons/Close'
import SmartPhoneIcon from '@material-ui/icons/Smartphone'
import HomeIcon from '@material-ui/icons/Home'
import EmailIcon from '@material-ui/icons/Email'
import CakeIcon from '@material-ui/icons/Cake'
import IconButton from '@material-ui/core/IconButton'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

function UserProfile ({ onClose, item }) {
  function getPhone () {
    if (!item[PHONE]) {
      return
    }
    const number = phoneUtil.parseAndKeepRawInput(item[PHONE], 'US')
    return phoneUtil.format(number, PNF.NATIONAL)
  }

  function getEmail () {
    return item[EMAIL] && <a href={`mailto:${item[EMAIL]}`} target='_blank' rel='noopener noreferrer'>{item[EMAIL]}</a>
  }

  function getAddress () {
    if (item[ADDRESS1] || item[ADDRESS2] || item[CITY] || item[STATE] || item[ZIP]) {
      return <div>
        {item[ADDRESS1] && <div>{item[ADDRESS1]}<br /></div>}
        {item[ADDRESS2] && <div>{item[ADDRESS2]}<br /></div>}
        {item[CITY] && <span>{item[CITY]}, </span>}
        {item[STATE] && <span>{item[STATE]} </span>}
        {item[ZIP] && <span>{item[ZIP]}</span>}
      </div>
    }
    return null
  }

  function getKeyVal (label, value, icon) {
    return !value ? null : (
      <div className='d-flex mb-2 align-items-top'>
        {icon}
        {/*<div className='mr-1 text-secondary' style={{ width: 90 }}>{label}:</div>*/}
        <div>{value}</div>
      </div>
    )
  }

  return (
    <SwipeableDrawer
      open
      anchor="right"
      onOpen={() => {
      }}
      onClose={() => onClose()}
    >
      <div className='clearfix' style={{ minWidth: 200 }}>
        <IconButton
          className='float-left'
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => onClose()}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className='mx-5'>
        <div className='d-flex justify-content-center mb-3 align-items-center'>
          <Avatar name={item[DISPLAY_NAME]} round color='#6247ea' size={40}
                  src={item[PHOTO_URL]} />
        </div>

        <div className='d-flex justify-content-center mb-3 align-items-center'>
          {item[DISPLAY_NAME]}
        </div>
        {
          getKeyVal(
            'Phone',
            getPhone(),
            <SmartPhoneIcon className='mr-2' style={{ fill: '#D2D6DB' }} />
          )
        }
        {
          getKeyVal(
            'Address',
            getAddress(),
            <HomeIcon className='mr-2' style={{ fill: '#D2D6DB' }} />
          )
        }
        {
          getKeyVal(
            'Email',
            getEmail(),
            <EmailIcon className='mr-2' style={{ fill: '#D2D6DB' }} />
          )
        }
        {
          getKeyVal(
            'Birthday',
            item[DATE_OF_BIRTH] && moment(item[DATE_OF_BIRTH]).format('MMMM D'),
            <CakeIcon className='mr-2' style={{ fill: '#D2D6DB' }} />
          )
        }
      </div>
    </SwipeableDrawer>
  )
}

UserProfile.propTypes = {
  item: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

export default UserProfile
