import axios from 'axios'
const ID = 'https://jsonbox.io/box_9dabf4f5cb4d73ea4791'
const VALUE_ID = '5e7acd9299ed160017dc2c93'
const PUT_ID = ID + '/' + VALUE_ID
const HEADERS = {
  headers: { 'content-type': 'application/json' }
}

interface ServerResponse {
  data: ServerData
}

interface ServerData {
  foo: ServerObject[]
  bar: number
}

interface ServerObject {
  item: string
}

class JsonBox {
  post = async data => {
    try {
      return await axios.post(ID, { items: data }, HEADERS)
    } catch (error) {
      return { error: true }
    }
  }
  put = async data => {
    try {
      return await axios.put(PUT_ID, { items: data }, HEADERS)
    } catch (error) {
      return []
    }
  }
  get = async () => {
    try {
      return await axios.get<ServerResponse>(ID)
    } catch (error) {
      return []
    }
  }
}

export default new JsonBox()
