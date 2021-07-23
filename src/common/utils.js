function formDate(date) {
  let newdate = new Date(date)
  let year = newdate.getFullYear()
  let month = newdate.getMonth() + 1
  let day = newdate.getDate()
  let hour = newdate.getHours()
  let min = newdate.getMinutes()
  let s = newdate.getSeconds()
  return `${year}-${month}-${day} ${hour}:${min}:${s}`
}

export { formDate }
