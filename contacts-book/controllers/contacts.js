const {
  ContactModel,
  Pager,
  sortContacts,
  filterContacts,
  InvalidContactSchemaError
} = require('@jworkman-fs/asl')

// The library's InvalidEnumError cannot be constructed (its base class references
// an undefined symbol), so we define an equivalent 400-level error locally.
class InvalidEnumError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidEnumError'
    this.statusCode = 400
  }
}

// Enums defined by the API spec
const FIELDS     = ['fname', 'lname', 'email', 'birthday']
const OPERATORS  = ['eq', 'gt', 'gte', 'lt', 'lte']
const DIRECTIONS = ['asc', 'desc']
const MAX_LIMIT  = 20

// Map a library exception to the status code the spec requires
const handleError = (res, e) => {
  switch (e.name) {
    case 'ContactNotFoundError':
      return res.status(404).json({ message: e.message })
    case 'PagerOutOfRangeError':
      return res.status(416).json({ message: e.message })
    case 'DuplicateContactResourceError':
      return res.status(409).json({ message: e.message })
    case 'InvalidEnumError':
    case 'InvalidOperatorError':
    case 'InvalidContactError':
    case 'InvalidContactFieldError':
    case 'BlankContactFieldError':
    case 'InvalidContactSchemaError':
    case 'InvalidContactResourceError':
    case 'PagerLimitExceededError':
      return res.status(400).json({ message: e.message })
    default:
      return res.status(500).json({ message: e.message || 'Internal server error.' })
  }
}

// Throw if a value is not one of the allowed enum values
const assertEnum = (value, allowed, label) => {
  if (!allowed.includes(value)) {
    throw new InvalidEnumError(`"${value}" is not a valid ${label}. Allowed values: ${allowed.join(', ')}.`)
  }
}

// Route params must be positive integers
const parseId = (raw) => {
  if (!/^\d+$/.test(raw)) {
    throw new InvalidContactSchemaError(`"${raw}" is not a valid contact id. Ids must be integers.`)
  }
  return Number(raw)
}

// Only the four schema fields may be submitted; id comes from the URL
const pickFields = (body) => {
  const allowed = ['fname', 'lname', 'email', 'phone', 'birthday']
  const fields = {}
  Object.keys(body || {}).forEach((key) => {
    if (key === 'id') return
    if (!allowed.includes(key)) {
      throw new InvalidContactSchemaError(`"${key}" is not a valid contact field.`)
    }
    fields[key] = body[key]
  })
  return fields
}

// GET /contacts  (filter -> sort -> paginate)
const index = (req, res) => {
  try {
    // Work on a copy; the library sorts in place
    let results = [...ContactModel.index()]

    // Filtering (headers, not query params, per the assignment)
    const by = req.get('X-Filter-By')
    const op = req.get('X-Filter-Operator')
    const val = req.get('X-Filter-Value')
    const filterHeaders = [by, op, val].filter((h) => h !== undefined)
    if (filterHeaders.length > 0 && filterHeaders.length < 3) {
      throw new InvalidEnumError('Filtering requires all three headers: X-Filter-By, X-Filter-Operator and X-Filter-Value.')
    }
    if (filterHeaders.length === 3) {
      assertEnum(by, FIELDS, 'X-Filter-By field')
      assertEnum(op, OPERATORS, 'X-Filter-Operator')
      try {
        results = filterContacts(by, op, val, results)
      } catch (e) {
        // No matches is a valid, empty result set, not an error
        if (e.name === 'NoContactsFoundError') results = []
        else throw e
      }
    }

    // Sorting (only when requested; unsorted results keep their stored order)
    if (req.query.sort !== undefined || req.query.direction !== undefined) {
      const sort = req.query.sort || 'fname'
      const direction = req.query.direction || 'asc'
      assertEnum(sort, FIELDS, 'sort field')
      assertEnum(direction, DIRECTIONS, 'sort direction')
      results = sortContacts(results, sort, direction)
    }

    // Pagination (spec calls it "size", the test script calls it "limit")
    const page = req.query.page || 1
    const limit = req.query.size || req.query.limit || 10
    if (!/^\d+$/.test(String(page)) || !/^\d+$/.test(String(limit))) {
      throw new InvalidEnumError('"page" and "size" must be positive integers.')
    }
    if (Number(limit) > MAX_LIMIT) {
      throw new InvalidEnumError(`The page size cannot exceed ${MAX_LIMIT} results.`)
    }

    if (results.length === 0) {
      res.set('X-Results-Total', 0)
      res.set('X-Page-Total', 0)
      res.set('X-Page-Next', 1)
      res.set('X-Page-Prev', 1)
      return res.status(200).json([])
    }

    const pager = new Pager(results, page, limit)
    res.set('X-Results-Total', pager.total)
    res.set('X-Page-Total', pager.pages)
    res.set('X-Page-Next', pager.next())
    res.set('X-Page-Prev', pager.prev())
    return res.status(200).json(pager.results())
  } catch (e) {
    return handleError(res, e)
  }
}

// GET /contacts/:id
const show = (req, res) => {
  try {
    const id = parseId(req.params.id)
    return res.status(200).json(ContactModel.show(id))
  } catch (e) {
    return handleError(res, e)
  }
}

// POST /contacts
const create = (req, res) => {
  try {
    const fields = pickFields(req.body)
    // The library's duplicate check references an undefined class, so check here
    if (ContactModel.index().some((c) => c.email === fields.email)) {
      return res.status(409).json({ message: 'A contact with the same email already exists.' })
    }
    const contact = ContactModel.create(fields)
    return res.redirect(303, `${req.baseUrl}/${contact.id}`)
  } catch (e) {
    return handleError(res, e)
  }
}

// PUT /contacts/:id
const update = (req, res) => {
  try {
    const id = parseId(req.params.id)
    const fields = pickFields(req.body)
    ContactModel.update(id, fields)
    return res.redirect(303, `${req.baseUrl}/${id}`)
  } catch (e) {
    return handleError(res, e)
  }
}

// DELETE /contacts/:id
const remove = (req, res) => {
  try {
    const id = parseId(req.params.id)
    ContactModel.remove(id)
    return res.redirect(303, req.baseUrl)
  } catch (e) {
    return handleError(res, e)
  }
}

module.exports = { index, show, create, update, remove }
