import 'firebase/firestore'
import 'firebase/storage'
import firebase from 'firebase'
import React, { useEffect, useState } from "react"
import SelectFileButton from './SelectFileButton'
import Button from '@material-ui/core/Button'
import _ from 'underscore'
import Promise from 'bluebird'
import moment from 'moment'
import DailyGallery from './DailyGallery'

const uuidv4 = require('uuid/v4')
const PHOTOS = 'photos'
const ITEMS = 'items'

function App () {
  const [items, setItems] = useState([])
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState('')

  useEffect(() => {
    async function fetchData () {
      const docRef = firebase.firestore().doc(`${PHOTOS}/${ITEMS}`)
      const docData = await docRef.get()
      // console.log('docData:', docData)
      const data = docData.data()
      let photos = await Promise.map(data.values, async (entry) => {
        const {
          thumbnailWidth,
          // thumbnailHeight,
          thumbnailFileName,

          originalWidth,
          originalHeight,
          originalFileName,

          createdAt
        } = entry
        const storageRef = firebase.storage().ref()
        const thumbnailDownloadURL = await storageRef.child(thumbnailFileName).getDownloadURL()
        const originalDownloadURL = await storageRef.child(originalFileName).getDownloadURL()
        const srcSet = [
          `${thumbnailDownloadURL} ${Math.round(thumbnailWidth)}w`,
          `${originalDownloadURL} ${Math.round(originalWidth)}w`
        ]
        return {
          src: originalDownloadURL,
          srcSet,
          sizes: [`(max-width: ${Math.round(originalWidth - 1)}px) ${Math.round(thumbnailWidth)}px,${Math.round(originalWidth)}px`],

          width: originalWidth,
          height: originalHeight,
          createdAt
        }
      })
      console.log('photos', photos)
      photos = _.filter(photos, x => !!x.src)
      const groupedPhotos = _.groupBy(photos, (item) => {
        const res = moment(item.createdAt).local().format('YYYY-MM-DD')
        // console.log('createdAt:', item.createdAt, 'res:', res)
        delete item.createdAt
        return res
      })
      console.log('groupedPhotos:', groupedPhotos)
      setItems(groupedPhotos)
    }

    fetchData()
  }, [])

  const uploadFiles = (files) => {
    console.log('files', files)
    files.forEach((file) => {
      if (file.name.toLowerCase().indexOf('thumb') > -1) {
        console.warn('Skipping file.  It has the word "thumb" in it.', file.name)
        return
      }
      if (file.size > 0 && file.size < 1024 * 512) { // too small
        console.warn('Skipping file.  Size is too small', file.size)
        return
      }
      console.log('file.size:', file.size)
      const storageRef = firebase.storage().ref()
      const originalFileName = file.name + '_' + uuidv4()
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
            default:
              console.error('Unknown upload state.', snapshot.state)
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
            default:
              console.error('Unknown error code.', error.code)
              break
          }
        }, async () => {
          try {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
            setDownloadURL(downloadURL)
            console.log('after firestore.set.')
            const generateThumbnailHTTP = firebase.functions().httpsCallable('generateThumbnailHTTP')
            const resp = await generateThumbnailHTTP({
              doc: `${PHOTOS}/${ITEMS}`,
              fileName: originalFileName
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
      <SelectFileButton
        className='my-4'
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
        _.map(items, (innerItems, date, index) => (
          <DailyGallery key={date} date={moment(date, 'YYYY-MM-DD').format('LL')} items={innerItems} />
        ))
      }
    </div>
  )
}

export default App
