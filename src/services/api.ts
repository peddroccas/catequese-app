import { db } from './firebase'

export async function getCatechists() {
  const databaseRef = db.ref('catechists')
  const snapShot = await databaseRef.once('value')
  const data = snapShot.val()
  return data
}

export async function getClassrooms() {
  const databaseRef = db.ref('classroom')
  const snapShot = await databaseRef.once('value')
  const data = snapShot.val()

  return data
}

export async function getCatechizings() {
  const databaseRef = db.ref('catechizing')
  const snapShot = await databaseRef.once('value')
  const data = snapShot.val()

  return data
}
