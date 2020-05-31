export default class MenuDate extends Date {
  constructor(year, week) {
    super();
    this.date =
      typeof year !== "undefined"
        ? new Date(year, 0, 1 + (parseInt(week, 10) - 1) * 7)
        : new Date();
    return this;
  }

  // TypeError: this is not a Date object.
  // This is rediculous, it's meant to extend the Date object but it doesn't.
  // I couldn't find any information on this, ES6 usage of class definitions are still too new.
  // I'll have to investigate later.
  getDay() {
    return this.date.getDay();
  }

  setHours(hours) {
    return this.date.setHours(hours);
  }

  getDate() {
    return this.date.getDate();
  }

  getMonth() {
    return this.date.getMonth();
  }

  // Actual new methods of IDate
  toFirstDayOfTheWeek() {
    this.date.setHours(-24 * this.date.getDay());
    return this;
  }

  toLastDayOfTheWeek() {
    this.date.setHours(24 * (6 - this.date.getDay()));
    return this;
  }

  getWeek() {
    // Copy date so don't modify original
    const d = new Date(
      Date.UTC(
        this.date.getFullYear(),
        this.date.getMonth(),
        this.date.getDate()
      )
    );
    // Set to nearest Thursday: current date + 4 - current day number
    d.setUTCDate(d.getUTCDate() + 4 - d.getUTCDay());
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    // Return array of year and week number
    return weekNo;
  }

  getYear() {
    return this.date.getFullYear();
  }

  nextWeek() {
    let t = this.date.getTime();
    t += 7 * 86400000;
    this.date.setTime(t);
    return this;
  }

  getDayText() {
    const daysText = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysText[this.getDay()];
  }

  getMonthText() {
    const monthsText = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthsText[this.getMonth()];
  }

  getNth() {
    if (this.getDate() > 3 && this.getDate() < 21) return "th";
    switch (this.getDate() % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  formatText() {
    return `${this.getDayText()} ${this.getDate()}${this.getNth()} ${this.getMonthText()}`;
  }

  isBefore(menudate) {
    return (
      this.getWeek() < menudate.getWeek() || this.getYear() < menudate.getYear()
    );
  }
}
