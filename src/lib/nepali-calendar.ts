import NepaliDate from 'nepali-date-converter';

const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत'
];

const NEPALI_MONTHS_EN = [
  'Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const NEPALI_DAYS = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert English digits to Nepali Devanagari digits (e.g. 1250 -> १२५०)
 */
export function toDevanagariDigits(num: number | string): string {
  return num
    .toString()
    .split('')
    .map(char => {
      const digit = parseInt(char, 10);
      return isNaN(digit) ? char : DEVANAGARI_DIGITS[digit];
    })
    .join('');
}

/**
 * Format currency with South Asian comma separation (e.g. 150000 -> Rs. 1,50,000 / रु. १,५०,०००)
 */
export function formatNPR(amount: number, inDevanagari: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount * 100) / 100);
  const parts = absAmount.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] === '00' ? '' : `.${parts[1]}`;

  // South Asian comma formatting: last 3 digits, then groups of 2
  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  const formattedStr = `${isNegative ? '-' : ''}${integerPart}${decimalPart}`;

  if (inDevanagari) {
    return `रु. ${toDevanagariDigits(formattedStr)}`;
  }
  return `Rs. ${formattedStr}`;
}

/**
 * Get current date in Bikram Sambat (B.S.) object and formatted strings
 */
export function getNepaliDate(dateInput?: Date | string | number) {
  try {
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const npDate = new NepaliDate(dateObj);
    const year = npDate.getYear();
    const monthIndex = npDate.getMonth(); // 0 to 11
    const day = npDate.getDate();
    const dayOfWeek = npDate.getDay(); // 0 to 6

    const monthNameNp = NEPALI_MONTHS[monthIndex];
    const monthNameEn = NEPALI_MONTHS_EN[monthIndex];
    const dayNameNp = NEPALI_DAYS[dayOfWeek];

    const bsIso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const bsFormattedNp = `${toDevanagariDigits(year)} ${monthNameNp} ${toDevanagariDigits(day)}, ${dayNameNp}`;
    const bsFormattedEn = `${year} ${monthNameEn} ${day}`;

    return {
      year,
      month: monthIndex + 1,
      day,
      monthNameNp,
      monthNameEn,
      dayNameNp,
      bsIso,
      bsFormattedNp,
      bsFormattedEn,
      adFormatted: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
  } catch {
    const fallback = new Date();
    return {
      year: 2083,
      month: 5,
      day: 4,
      monthNameNp: 'भाद्र',
      monthNameEn: 'Bhadra',
      dayNameNp: 'बिहीबार',
      bsIso: '2083-05-04',
      bsFormattedNp: '२०८३ भाद्र ४',
      bsFormattedEn: '2083 Bhadra 4',
      adFormatted: fallback.toLocaleDateString(),
    };
  }
}
