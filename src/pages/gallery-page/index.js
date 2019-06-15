import 'firebase/firestore'
import 'firebase/storage'
import firebase from 'firebase'
import React, { useEffect, useState } from "react"
import Gallery from "react-photo-gallery"
import Photo from "./photo"
import arrayMove from "array-move"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import Carousel, { Modal, ModalGateway } from "react-images"
import SelectFileButton from './uploader/SelectFileButton'
import Button from '@material-ui/core/Button'
import moment from 'moment'
import _ from 'underscore'
import Promise from 'bluebird'

const uuidv4 = require('uuid/v4')
const PHOTOS = 'photos'
const ITEMS = 'items'

// const photos = require("./photos.json")

/* popout the browser and maximize to see more rows! -> */
const SortablePhoto = SortableElement(item => <Photo {...item} />)
const SortableGallery = SortableContainer(({ items }) => (
  <Gallery photos={items} renderImage={SortablePhoto} />
))


function App () {
  const [items, setItems] = useState([])
  const [currentImage, setCurrentImage] = useState(0)
  const [viewerIsOpen, setViewerIsOpen] = useState(false)
  const [isSortable, setIsSortable] = useState(true)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState('')

  useEffect(async () => {
    const docRef = firebase.firestore().doc(`${PHOTOS}/${ITEMS}`)
    const docData = await docRef.get()
    console.log('docData:', docData)
    const data = docData.data()
    _.each(data, async (entries) => {
      const values = _.values(entries)
      let photos = await Promise.map(values, async ({ thumbnailHeight, thumbnailWidth, thumbnailFileName }) => {
        const storageRef = firebase.storage().ref()
        let downloadURL = await storageRef.child(thumbnailFileName).getDownloadURL()
        return {
          src: downloadURL,
          height: thumbnailHeight,
          width: thumbnailWidth
        }
      })
      photos = _.filter(photos, x => !!x.src)
      console.log('photos:', photos)
      setItems(photos)
    })
  }, [])

  const openLightbox = (event, obj) => {
    setCurrentImage(obj.index)
    setViewerIsOpen(true)
  }
  const closeLightbox = () => {
    setCurrentImage(0)
    setViewerIsOpen(false)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMove(items, oldIndex, newIndex))
  }

  const uploadFiles = (files) => {
    console.log('files', files)
    files.forEach((file, index) => {

      const storageRef = firebase.storage().ref()
      const originalFileName = uuidv4()
      const ref = storageRef.child(originalFileName)

      let uploadTask = ref.put(file)
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

          setProgress(progress)
          // this.addTransitionState(event, FileUploader.UPLOAD_PROGRESS, file.key)

          console.log('Upload is ' + progress + '% done')
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused')
              break
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running')
              break
          }
        }, (error) => {
          console.log('error:', error)
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break

            case 'storage/canceled':
              // User canceled the upload
              break

            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break
          }
        }, async () => {
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
            setDownloadURL(downloadURL)
            let DATE = moment().utc().format('YYYY-MM-DD')
            let ENTRY = moment().utc().format() + '-' + index
            const docRef = firebase.firestore().doc(`${PHOTOS}/${ITEMS}`)
            await docRef.set({
              [DATE]: {
                [ENTRY]: {
                  originalFileName,
                  originalUrl: downloadURL,
                  uploadedBy: firebase.auth().currentUser.uid
                }
              }
            }, { merge: true })
            console.log('after firestore.set.')
            const updatePhotosHTTP = firebase.functions().httpsCallable('updatePhotosHTTP')
            const resp = await updatePhotosHTTP({
              doc: `${PHOTOS}/${ITEMS}`,
              date: DATE,
              entry: ENTRY
            })
            console.log('function returned a response.', resp)
          } catch (err) {
            console.error('error:', err)
          }
        }
      )
    })
  }

  console.log('progress:', progress)
  console.log('downloadURL:', downloadURL)

  return (
    <div>
      <SelectFileButton className='my-4'
        multiple
        onChange={event => {
          uploadFiles([].concat(Array.from(event.target.files)))
          // this.setState({ files: this.state.files.concat(Array.from(event.target.files)) })
        }}
        button={(
          <Button
            variant="contained"
            size="large"
            color="primary"
            // style={styles.controlStyle}
          >
            Upload images
            {/*<Icon style={{ marginLeft: 10 }}>cloud_upload</Icon>*/}
          </Button>
        )}
      />
      {
        isSortable
          ?
          <SortableGallery items={items} onSortEnd={onSortEnd} axis={"xy"} />
          :
          <div>
            <Gallery photos={items} onClick={openLightbox} />
            <ModalGateway>
              {viewerIsOpen ? (
                <Modal onClose={closeLightbox}>
                  <Carousel
                    currentIndex={currentImage}
                    views={items.map(x => ({
                      ...x,
                      srcset: x.srcSet,
                      caption: x.title
                    }))}
                  />
                </Modal>
              ) : null}
            </ModalGateway>
          </div>
      }
    </div>
  )
}

export default App
