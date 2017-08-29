export default class MenuDate extends Date {
  constructor (year, month, day) {
    super()
    this.date = (typeof year !== 'undefined')
      ? new Date(year, month, day)
      : new Date()

    return this
  }

  // TypeError: this is not a Date object.
  // This is rediculous, it's meant to extend the Date object but it doesn't.
  // I couldn't find any information on this, ES6 usage of class definitions are still too new.
  // I'll have to investigate later.
  getDay () {
    return this.date.getDay()
  }

  setHours (hours) {
    return this.date.setHours(hours)
  }

  getDate () {
    return this.date.getDate()
  }

  getMonth () {
    return this.date.getMonth()
  }

  getFullYear () {
    return this.date.getFullYear()
  }

  // Actual new methods of IDate
  toFirstDayOfTheWeek () {
    this.date.setHours(-24 * this.date.getDay())
    return this
  }

  toLastDayOfTheWeek () {
    this.date.setHours(24 * (6 - this.date.getDay()))
    return this
  }

  getDateWeek () {
    var onejan = new Date(this.getFullYear(), 0, 1)
    return Math.ceil((((this.date - onejan) / 86400000) + onejan.getDay() + 1) / 7)
  }

  nextDateWeek () {
    var t = this.date.getTime()
    t += 7 * 86400000
    this.date.setTime(t)
    return this
  }

  getDayText () {
    var daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return daysText[this.getDay()]
  }

  getMonthText () {
    var monthsText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthsText[this.getMonth()]
  }

  getNth () {
    if (this.getDate() > 3 && this.getDate() < 21) return 'th'
    switch (this.getDate() % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  formatText () {
    return `${this.getDayText()} ${this.getDate()}${this.getNth()} ${this.getMonthText()}`
  }
}
