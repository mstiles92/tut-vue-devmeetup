import * as moment from 'moment'

export default (value) => {
    const m = moment(value)
    return m.format('dddd, MMMM Do YYYY, h:mm:ss a')
}
