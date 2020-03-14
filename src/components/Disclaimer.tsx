import React, { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Cookies from 'js-cookie'

const KEY = 'disclaimer'
const VALUE = 'accepted'
const expires = 7

const Disclaimer = () => {
  const [show, setShow] = useState(false)

  const handleAccept = () => {
    Cookies.set(KEY, VALUE, {expires})
    setShow(false)
  }

  const handleDecline = () => {
    // @ts-ignore
    window.location = 'https://google.com'
  }
  useEffect(() => {
    Cookies.get(KEY) !== VALUE && setShow(true)
  }, [])

  return (
    <Modal centered show={show} backdrop='static'>
      <Modal.Header className="border-0">
        <Modal.Title className="text-center">Disclaimer</Modal.Title>
      </Modal.Header>

      <Modal.Body className='text-justify'>
        <p className='mb-2'>
          This website does not provide medical advice. It is intended for informational purposes only. It is
          not a
          substitute for professional medical advice, diagnosis or treatment.
        </p>
        <p className='mb-2'>
          Never ignore professional medical advice in seeking treatment because of something you have read on
          this
          website.
        </p>
        <p>
          If you think you or someone you know may have a medical emergency, immediately call your doctor or
          dial 911.
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button className="border-dark" variant="light" onClick={handleDecline}>Decline</Button>
        <Button className="ml-4" variant="success" onClick={handleAccept}>I Accept</Button>
      </Modal.Footer>
    </Modal>
  )
}

// @ts-ignore
export default Disclaimer
