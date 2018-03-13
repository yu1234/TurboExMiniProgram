export default class TbError extends Error {
  code = 0
  name = null

  constructor(message, code) {
    super(message) // (1)
    this.name = 'TbError' // (2)
    this.code = code
  }
}
