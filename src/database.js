import {db} from './db';

let database = {
  deleteRow: async function (database, id) {
    await db[database].delete(id);
  },
  addRow: async function (database, data) {
    let id =await db[database].add(data);
    return id
  },
  putRow: async function (database, data) {
    await db[database].put(data);
  },
  getRows: async function (database) {
    let rows = await db[database]
      .toArray()
    if (rows.length > 0) {
      return rows
    } else {
      return null
    }
  },
  getRowById: async function(database){

  },
  getRow: async function (database) {
    let row = await db[database]
      .toArray()
    if (row.length > 0) {
      return row[0]
    } else {
      return null
    }
  }
}

export default database
