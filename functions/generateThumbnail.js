const jimp = require('jimp')
const fs = require('fs')
const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))
const exif = require('exif-parser')
const moment = require('moment')
const md5File = require('md5-file')

module.exports = (admin) => {
  const firestore = admin.firestore()
  const storage = admin.storage()
  const bucket = storage.bucket('belmont-runners-1548537264040.appspot.com')

  return async (data, context) => {
    console.info('data:', data)
    console.info('context:', context)
    const docRef = firestore.doc(data.doc)
    let entry = {
      originalFileName: data.fileName
      // todo: add uploaded by entry
    }
    const setIsDuplicate = async (entry) => {
      const docData = await docRef.get()
      let currData = docData.data()

      let values = currData && currData.values || []
      console.info('entry.md5:', entry.md5)
      const foundEntry = values.find((currEntry) => {
        return currEntry.md5 === entry.md5
      })
      entry.isDuplicate = Boolean(foundEntry)
      return values
    }
    try {
      // const doc = await docRef.get()
      // docData = doc.data()
      // entry = docData[data.date][data.entry]
      console.info('entry', entry)

      const originalFileNameLocal = '/tmp/' + entry.originalFileName
      await bucket.file(entry.originalFileName).download({ destination: originalFileNameLocal })

      entry.md5 = md5File.sync(originalFileNameLocal)

      await setIsDuplicate(entry)
      console.info('entry.isDuplicate:', entry.isDuplicate)
      if (entry.isDuplicate) {
        return
      }
      console.info('after download.', originalFileNameLocal, fs.existsSync(originalFileNameLocal))
      const size = await sizeOf(originalFileNameLocal)
      entry.originalWidth = size.width
      entry.originalHeight = size.height
      entry.originalSize = fs.statSync(originalFileNameLocal).size
      entry.type = size.type
      console.info('Entry with sizes:', entry)


      /////////////////// exif ///////////////////////
      if (entry.type === 'jpg') {
        const buffer = fs.readFileSync(originalFileNameLocal)
        const parser = exif.create(buffer)
        const result = parser.parse()
        console.info()
        console.info('exif:', JSON.stringify(result, null, 2))
        const DateTimeOriginal = result && result.tags && result.tags.DateTimeOriginal
        const CreateDate = result && result.tags && result.tags.CreateDate
        console.info('DateTimeOriginal:', DateTimeOriginal)
        console.info('CreateDate:', CreateDate)

        console.info()
        entry.createdAt = moment.unix(CreateDate || DateTimeOriginal || 0).utc().format()
      }


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
      const thumbnailFileNameLocal = '/tmp/' + entry.thumbnailFileName
      if (entry.thumbnailWidth === entry.originalWidth &&
        entry.thumbnailHeight === entry.originalHeight) {
        console.info('no need to resize image')
        fs.copyFileSync(originalFileNameLocal, thumbnailFileNameLocal)
      } else {
        console.info('calling jimp.read.', originalFileNameLocal)
        const image = await jimp.read(originalFileNameLocal)

        console.info('after jimp.read.  image:', Boolean(image))
        await image
          .resize(entry.thumbnailWidth, entry.thumbnailHeight) // resize
          .write(thumbnailFileNameLocal) // save
      }
      entry.thumbnailSize = fs.statSync(thumbnailFileNameLocal).size

      console.info('Uploading thumbnail to storage. entry.thumbnailFileName:', entry.thumbnailFileName)
      await bucket.upload(thumbnailFileNameLocal, {
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
      console.info('Thumbnail uploaded successfully.')
      if (!entry.isDuplicate) {
        const values = await setIsDuplicate(entry)
        console.info('entry.isDuplicate:', entry.isDuplicate)
        if (!entry.isDuplicate) {
          values.unshift(entry)
          await docRef.set({ values }, { merge: true })
          console.info('Uploaded successfully.')
        }
      }
      await entry
    } catch (err) {
      console.error('error:', err)
      throw new Error('Something went wrong...')
    }
  }
}
