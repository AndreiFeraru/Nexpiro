export class Utils {
  static getDateFormatted(dateString: string): string {
    return dateString.split('T')[0];
  }
}
