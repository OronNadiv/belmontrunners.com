import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

const Disclaimer = () => {
  const [show, setShow] = useState(true)

  const handleOK = () => {
    setShow(false)
  }

  return (
    <Modal centered show={show} onHide={handleOK}>
      <Modal.Header className="border-0">
        <Modal.Title className="text-center">Important Update</Modal.Title>
      </Modal.Header>

      <Modal.Body className='text-justify'>
        <p className='mb-2'>
          Effective Friday, March 13, Belmont Runners is canceling our group runs and events until further notice due to
          the Coronavirus pandemic (COVID-19). Our club promotes public wellness and we want to do our part to support
          public health advisories, including social distance guidelines.
        </p>
        <p className='mb-2 text-primary'>
          We will continue to monitor the fluid situation and provide updates as needed.
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex justify-content-center">
        <Button className="px-4" variant="success" onClick={handleOK}>OK</Button>
      </Modal.Footer>
    </Modal>
  )
}

// @ts-ignore
export default Disclaimer
