const fs = require('fs')
const path = require('path')

// Clients that send JSON get JSON back; browsers get HTML
const wantsJson = (req) => (req.get('Content-Type') || '').includes('application/json') || req.get('Accept') === 'application/json'

// Each resource can have one image at public/uploads/<folder>/<id>.<ext>
const imageFor = (folder, id) => {
  const dir = path.join(__dirname, '..', 'public', 'uploads', folder)
  const file = fs.readdirSync(dir).find((f) => f.startsWith(`${id}.`))
  return file ? `/uploads/${folder}/${file}` : null
}

const saveImage = (folder, id, file) => {
  if (!file) return
  const dir = path.join(__dirname, '..', 'public', 'uploads', folder)
  fs.readdirSync(dir).filter((f) => f.startsWith(`${id}.`)).forEach((f) => fs.unlinkSync(path.join(dir, f)))
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
  fs.writeFileSync(path.join(dir, `${id}${ext}`), file.buffer)
}

module.exports = { wantsJson, imageFor, saveImage }
