import { ref } from '../config/constants'

export function fetchDings () {
  return ref.child(`dings`).once('value')
    .then((snapshot) => snapshot.val())
    .catch((error) => { console.log(error) })
}
