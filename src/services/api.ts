import { catechizing } from '../Types'
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
  const data: catechizing[] = snapShot.val()
  data.forEach((data) =>
    data.payment.installment[0].value === 0
      ? data.payment.installment.shift()
      : '',
  )

  return data
}

export async function setPayments(
  catechizing: catechizing,
  value: number,
  payedAt: string,
) {
  const databaseRef = db.ref(`catechizing/${catechizing.id}/payment`)
  await databaseRef.set({
    installment: [...catechizing.payment.installment, { value, payedAt }],
    toBePaid: catechizing.payment.toBePaid - value,
  })
}
