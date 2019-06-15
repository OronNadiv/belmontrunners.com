const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()
const storage = admin.storage()
const jimp = require('jimp')

// exports.updatePhotosHTTP = functions.https.onCall((data, context) => {
//   console.info('data:', data)
//   const docRef = firestore.doc(data.doc)
//   let docData
//   let entry
//   try {
//     return docRef.get()
//       .then((doc) => {
//         docData = doc.data()
//         entry = docData[data.date][data.entry]
//         console.info('entry', entry)
//
//         const requestImageSize = require('request-image-size')
//
//         const originalUrl = entry.originalUrl
//         return requestImageSize(originalUrl)
//       })
//       .then(({ height, width, downloaded, type }) => {
//         entry.originalWidth = width
//         entry.originalHeight = height
//         entry.originalSize = downloaded
//         entry.type = type
//         console.info('Entry with sizes:', entry)
//         return entry
//       })
//       .then(() => {
//         const maxWidth = 400
//         const maxHeight = 400
//         let ratio
//         let width
//         let height
//         const { originalHeight, originalWidth } = entry
//         console.info('originalWidth:', originalWidth, 'originalHeight:', originalHeight)
//
//         // Check if the current width is larger than the max
//         if (originalWidth > maxWidth) {
//           const ratio = maxWidth / originalWidth   // get ratio for scaling image
//           height = originalHeight * ratio    // Reset height to match scaled image
//           width = originalWidth * ratio    // Reset width to match scaled image
//         }
//
//         // Check if current height is larger than max
//         if (height > maxHeight) {
//           ratio = maxHeight / originalHeight // get ratio for scaling image
//           width = originalWidth * ratio    // Reset width to match scaled image
//           height = originalHeight * ratio    // Reset height to match scaled image
//         }
//
//         console.info('width:', width, 'height:', height)
//         entry.thumbnailFileName = `${entry.originalFileName}-thumbnail`
//         entry.thumbnailWidth = width || originalWidth
//         entry.thumbnailHeight = height || originalHeight
//         console.info('calling jimp.read.', entry.originalUrl)
//         return jimp.read(entry.originalUrl)
//       })
//       .then(image => {
//         console.info('after jimp.read.  image:', Boolean(image))
//         return image
//           .resize(entry.thumbnailWidth, entry.thumbnailHeight) // resize
//           .write(entry.thumbnailFileName) // save
//       })
//       .then(() => {
//         console.info('uploading result to storage. entry.thumbnailFileName:', entry.thumbnailFileName)
//         const bucket = storage.bucket('belmont-runners-1548537264040.appspot.com')
//         return bucket.upload(entry.thumbnailFileName, {
//           // Support for HTTP requests made with `Accept-Encoding: gzip`
//           gzip: true,
//           // By setting the option `destination`, you can change the name of the
//           // object you are uploading to a bucket.
//           metadata: {
//             // Enable long-lived HTTP caching headers
//             // Use only if the contents of the file will never change
//             // (If the contents will change, use cacheControl: 'no-cache')
//             contentType: `image/${entry.type}`,
//             cacheControl: `public, max-age=${60 * 60 * 24}`
//           }
//         })
//       })
//       .then((thumbnail) => {
//         console.info('Uploaded successfully.')
//         entry.thumbnailUrl = thumbnail[0].metadata.mediaLink
//         return entry
//       })
//       .catch(err => {
//         entry.error = JSON.stringify(err)
//         console.error('error:', err)
//         throw entry
//       })
//       .finally(() => {
//         docData[data.date][data.entry] = entry
//         return docRef.set(docData, { merge: true })
//       })
//   } catch (err) {
//     console.error('error:', err)
//     throw err
//   }
// })

exports.updatePhotosHTTP = functions.https.onCall(async (data, context) => {
  console.info('data:', data)
  const docRef = firestore.doc(data.doc)
  let docData
  let entry
  try {
    const doc = await docRef.get()
    docData = doc.data()
    entry = docData[data.date][data.entry]
    console.info('entry', entry)

    const requestImageSize = require('request-image-size')

    const originalUrl = entry.originalUrl
    const size = await requestImageSize(originalUrl)
    entry.originalWidth = size.width
    entry.originalHeight = size.height
    entry.originalSize = size.downloaded
    entry.type = size.type
    console.info('Entry with sizes:', entry)

    const maxWidth = 400
    const maxHeight = 400
    let ratio
    let width
    let height
    const { originalHeight, originalWidth } = entry
    console.info('originalWidth:', originalWidth, 'originalHeight:', originalHeight)

    // Check if the current width is larger than the max
    if (originalWidth > maxWidth) {
      const ratio = maxWidth / originalWidth   // get ratio for scaling image
      height = originalHeight * ratio    // Reset height to match scaled image
      width = originalWidth * ratio    // Reset width to match scaled image
    }

    // Check if current height is larger than max
    if (height > maxHeight) {
      ratio = maxHeight / originalHeight // get ratio for scaling image
      width = originalWidth * ratio    // Reset width to match scaled image
      height = originalHeight * ratio    // Reset height to match scaled image
    }

    console.info('width:', width, 'height:', height)
    entry.thumbnailFileName = `${entry.originalFileName}-thumbnail`
    entry.thumbnailWidth = width || originalWidth
    entry.thumbnailHeight = height || originalHeight
    console.info('calling jimp.read.', entry.originalUrl)
    const image = await jimp.read(entry.originalUrl)


    console.info('after jimp.read.  image:', Boolean(image))
    await image
      .resize(entry.thumbnailWidth, entry.thumbnailHeight) // resize
      .write('/tmp/' + entry.thumbnailFileName) // save

    console.info('uploading result to storage. entry.thumbnailFileName:', entry.thumbnailFileName)
    const bucket = storage.bucket('belmont-runners-1548537264040.appspot.com')
    const thumbnail = await bucket.upload('/tmp/' + entry.thumbnailFileName, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        contentType: `image/${entry.type}`,
        cacheControl: `public, max-age=${60 * 60 * 24}`
      }
    })
    console.info('Uploaded successfully.')
    entry.thumbnailUrl = thumbnail[0].metadata.mediaLink
    return { entry }
  } catch (err) {
    entry.error = JSON.stringify(err)
    console.error('error:', err)
    throw new Error('Something went wrong...')
  } finally {
    docData[data.date][data.entry] = entry
    await docRef.set(docData, { merge: true })
  }
})
