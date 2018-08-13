export class DateHandler {

    public static getStringOfDate(date: Date): string {

        let year = `${date.getFullYear()}`;
        let month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
        let day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;

        return year + "-" + month + "-" + day;
    }

    public static getDateOfSTring(dateString: string): Date {

        let yearDayMonth = dateString.split("-");

        let year = parseInt(yearDayMonth[0], 10);
        let day = parseInt(yearDayMonth[2], 10);
        let month = (parseInt(yearDayMonth[1], 10) - 1);

        return new Date(year, month, day);
    }

    public static isValidDateString(dateString: string): boolean {

        if (dateString === null || dateString === undefined) {
            return false;
        }

        if (dateString.split === null || dateString.split === undefined) {
            return false;
        }

        let yearDayMonth = dateString.split("-");

        if (yearDayMonth.length !== 3) {
            return false;
        }

        let year = parseInt(yearDayMonth[0], 10);
        let day = parseInt(yearDayMonth[2], 10);
        let month = (parseInt(yearDayMonth[1], 10) - 1);

        if (day < 1 || day > 31) {
            return false;
        }
        if (month < 1 || month > 12) {
            return false;
        }
        if (year < 1) {
            return false;
        }
        return true;
    }
}