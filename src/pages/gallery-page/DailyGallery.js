import React, { useState } from "react"
import Gallery from "react-photo-gallery"
import Carousel, { Modal, ModalGateway } from "react-images"
import * as PropTypes from 'prop-types'

function DailyGallery ({ date, items }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [viewerIsOpen, setViewerIsOpen] = useState(false)

  const openLightbox = (event, obj) => {
    setCurrentImage(obj.index)
    setViewerIsOpen(true)
  }
  const closeLightbox = () => {
    setCurrentImage(0)
    setViewerIsOpen(false)
  }

  return (
    <div>
      <h3>{date}</h3>
      <Gallery photos={items} onClick={openLightbox} />
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              currentIndex={currentImage}
              views={items.map(x => {
                console.log('x:', x)
                return {
                  ...x,
                  srcset: x.srcSet,
                  caption: x.title
                }
              })}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  )
}

DailyGallery.propTypes = {
  date: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired
}
export default DailyGallery
