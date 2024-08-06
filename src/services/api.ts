import { db } from './firebase'

export async function getCatechists() {
  const databaseRef = db.ref('catechists')
  const snapShot = await databaseRef.once('value')
  const data = snapShot.val()
  console.log(data)
  return data
}

export async function getClassrooms() {
  const databaseRef = db.ref('classroom')
  const snapShot = await databaseRef.once('value')
  const data = snapShot.val()
  console.log(data)

  return data
}
