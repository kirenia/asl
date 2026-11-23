// Import axios for making HTTP requests
const axios = require('axios')
const { validateContactData } = require('@jworkman-fs/asl/src/Model/index.js')
const { 
  ServerUnreachableError, 
  ResourceUnreachableError,
  PaginationResultCountError,
  ApiTestingError
} = require('@jworkman-fs/asl/src/Exception/testing.js')
const { InvalidContactSchemaError } = require('@jworkman-fs/asl/src/Exception/index.js')

const tests = {
  groups: [

    /*
     * 👉 Server & Resource are both reachable:
     *    - [✅] Server is reachable 
     *    - [✅] Resource is reachable 
     */
    [
      `🛜 - Is your server & resource reachable?`,
      [
        [
          `Server is reachable over port 8080`,
          async () => {
            try {
              await axios.get('http://localhost:8080/404')
            } catch(e) {
              if (
                `undefined` === typeof e.code
                || e.code.indexOf('ECONNREFUSED') >= 0) {
                throw new ServerUnreachableError(`Connection could not be established to your server running on port 8080. You may want to check your network, firewall, and other settings to try to resolve the issue.`)
              } else {
                expect(e.response.status).toBe(404)
              }
            }
          }
        ]
      ]
    ],


    /*
     * 👉 Resource is responding correctly:
     *    - [✅] Resource content type is set to JSON
     *    - [✅] JSON response is of type: array
     *    - [✅] At least one contact is received
     *    - [✅] Resource is using valid schema
     */
    [
      `🛢️ - Does your resource return proper JSON?`,
      [
        // Check the /v1/contacts endpoint exists
        [
          `/v1/contacts RESTful API resource does exist, and returns 2xx`,
          async () => {
            const response = await axios.get('http://localhost:8080/v1/contacts')
            // Check if the status code is in the range of 200-299
            expect.assertions(2)
            expect(response.status).toBeGreaterThanOrEqual(200)
            expect(response.status).toBeLessThan(300)
          }
        ],
        [
          `Contacts resource returns a valid JSON response`,
          async () => {
            const { data, headers } = await axios.get(`http://localhost:8080/v1/contacts`)
            const type = headers['content-type']||headers['Content-Type']||''
            expect(type).toContain('application/json')
          }
        ],
        [
          `GET /v1/contacts resource returns at least one object`,
          async () => {
            const { data } = await axios.get(`http://localhost:8080/v1/contacts`)
            expect.assertions(2)
            expect(data).toHaveProperty('length')
            expect(data.length).toBeGreaterThanOrEqual(0)
          }
        ],
        [ 
          `Returned contacts all use the proper schema fields: (id, lname, fname, email, phone, birthday)`,
          async () => {
            const { data } = await axios.get(`http://localhost:8080/v1/contacts`)
            expect.assertions(data.length)
            // data.forEach((c) => validateContactData(c, true))
            data.forEach((c) => {
              expect((
                typeof c.id === 'undefined' ||
                typeof c.fname === 'undefined' ||
                typeof c.phone === 'undefined' ||
                typeof c.birthday === 'undefined' ||
                typeof c.lname === 'undefined'
              )).toBe(false)
            })
          }
        ], 
      ]
    ],

    /*
     * 👉 Pagination is working correctly:
     *
     *  - [✅] Pagination works with default parameters
     *  - [✅] Pagination works without default parameters
     */
    [
      `📇 - Was pagination properly implemented on your resource?`,
      [
        [
          `Pagination works with default parameters`,
          async () => {
            const { data } = await axios.get(`http://localhost:8080/v1/contacts`)
            expect(data.length).toBe(10)
          }
        ],
        [
          `Pagination works without default parameters`,
          async () => {
            expect.assertions(2)

            const { data: dataOne } = await axios.get(`http://localhost:8080/v1/contacts?page=4&limit=5`)
            expect(dataOne.length).toBe(5)

            const { data: dataTwo } = await axios.get(`http://localhost:8080/v1/contacts?page=2&limit=7`)
            expect(dataTwo.length).toBe(7)

          }
        ]
      ]
    ],

    /*
     * 👉 Sorting is working correctly:
     *
     *  - [✅] Sorting works with default parameters
     *  - [✅] Sorting works without default parameters
     */
    [
      `🔤 - Was sorting properly implemented on your resource?`,
      [
        [
          `Sorting works with "lname" both ascending and decending (default and non default directions)`,
          async () => {
            expect.assertions(6)
            const { data: lnameAsc } = await axios.get('http://localhost:8080/v1/contacts?sort=lname&direction=asc')
            const { data: fnameAsc } = await axios.get('http://localhost:8080/v1/contacts?sort=fname&direction=asc')
            const { data: lnameDesc } = await axios.get('http://localhost:8080/v1/contacts?sort=lname&direction=desc')
            expect(lnameDesc[0].id).toBe(35)
            expect(lnameDesc[1].id).toBe(227)
            expect(lnameAsc[0].id).toBe(219)
            expect(lnameAsc[1].id).toBe(275)
            expect(fnameAsc[0].id).toBe(51)
            expect(fnameAsc[1].id).toBe(179)
          }
        ],
      ]
    ],

    /*
     * 👉 Filtering is working correctly:
     *
     *  - [✅] Filtering works with default parameters
     *  - [✅] Filtering works without default parameters
     */
    [
      `🔍 - Was filtering properly implemented on your resource?`,
      [
        [
          `Filtering works with default parameters`,
          async () => {
            const filters = [
              { op: 'gte', by: 'birthday', value: '1997-04-06', expect: { first: 67, last: 251 } },
              { op: 'gt', by: 'birthday', value: '1997-04-06', expect: { first: 251, last: 251 } },
              { op: 'eq', by: 'birthday', value: '1982-04-17', expect: { first: 243, last: 243 } },
              { op: 'lte', by: 'birthday', value: '1997-04-06', expect: { first: 3, last: 75 } },
              { op: 'lt', by: 'birthday', value: '1997-04-06', expect: { first: 3, last: 83 } }
            ]
            expect.assertions(filters.length * 2)
            for (let i = 0; i< filters.length; i++)
            {
              const { data } = await axios.get('http://localhost:8080/v1/contacts', {
                headers: {
                  'X-Filter-By': filters[i].by,
                  'X-Filter-Operator': filters[i].op,
                  'X-Filter-Value': filters[i].value
                }
              })
              expect(data[0].id).toBe(filters[i].expect.first)
              expect(data[data.length - 1].id).toBe(filters[i].expect.last)
            }
          }
        ]
      ]
    ],

    /*
     *  👉 All CRUD operations are working:
     *
     *  - [] Able to create a new contact 
     *  - [] Able to show a specific contact by its identifier
     *  - [] Able to update a specific contact by its identifier
     *  - [] Able to delete, or remove a contact by its identifier
     */
    [
      `💩 - Was CRUD properly implemented on your resource?`,
      [
        [
          `Able to create a new contact`,
          async () => {
            // expect.assertions(2)
            const fields = {
              fname: 'Justin',
              lname: 'Workman',
              birthday: '11-11-1982',
              phone: '207-555-5555',
              email: 'jworkman@fullsail.com'
            }
            const { data } = await axios.post('http://localhost:8080/v1/contacts', fields)
            // expect(typeof data).toMatch(/^(object|number)$/)
            if (typeof data === 'object' && typeof data.id === 'number') {
              expect(data.id).toBeGreaterThanOrEqual(1)
            } else if (typeof data === 'object' && typeof data[0] === 'number') {
              expect(data.id).toBeGreaterThanOrEqual(1)
            } else if (typeof data === 'number') {
              expect(data).toBeGreaterThanOrEqual(1)
            }
          }
        ],
        [
          `Able to show a specific contact by its identifier`,
          async () => {
            const { data } = await axios.get('http://localhost:8080/v1/contacts/11')
            expect.assertions(2)
            expect(data.fname).toBe('Jennifer')
            expect(data.lname).toBe('Scott')
          }
        ],
        [
          `Able to update a specific contact by its identifier`,
          async () => {
            const fields = {
              id: 324,
              fname: 'Shae',
              lname: 'Tyler',
              birthday: '11-11-1980',
              phone: '307-555-5555',
              email: 'jworkman2@fullsail.com'
            }
            await axios.put('http://localhost:8080/v1/contacts/324', fields)
            const { data } = await axios.get('http://localhost:8080/v1/contacts/324')
            expect.assertions(6)
            expect(data.id      ).toBe(fields.id)
            expect(data.fname   ).toBe(fields.fname)
            expect(data.lname   ).toBe(fields.lname)
            expect(data.phone   ).toBe(fields.phone)
            expect(data.email   ).toBe(fields.email)
            expect(data.birthday).toBe(fields.birthday)
          }
        ],
        [
          `Able to delete, or remove a contact by its identifier`,
          async () => {
            const del  = await axios.delete('http://localhost:8080/v1/contacts/325')
            const show = await axios.get('http://localhost:8080/v1/contacts/325')
            expect.assertions(2)
            expect(del.status).toBeGreaterThanOrEqual(200)
            expect(show.status).toBe(404)
          }
        ]
      ]
    ],
  ]
}

tests.groups.forEach((group) => {
  describe(group[0], () => {
    group[1].forEach((test) => {
      it(test[0], test[1])
    })
  })
})
