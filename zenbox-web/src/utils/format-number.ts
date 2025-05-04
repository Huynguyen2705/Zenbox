import { formatNumberLocale } from 'src/locales';

export const formatNumber = (
  value?: number | null,
  options?: {
    digit?: number;
    offsetRate?: number;
    toFixed?: boolean;
    failoverValue?: string;
    isSkipRound?: boolean;
    floor?: boolean;
    showPlusPrefix?: boolean;
  },
) => {
  const {
    digit,
    offsetRate,
    toFixed,
    failoverValue,
    isSkipRound,
    floor,
    showPlusPrefix,
  } = options ?? {};
  if (value == null || isNaN(value)) {
    return failoverValue ?? '0';
  }

  let data = value;

  if (offsetRate != null) {
    data = value / offsetRate;
  }

  let tempValueString = data.toString();
  let prefix = showPlusPrefix ? '+' : '';

  if (tempValueString.startsWith('-')) {
    prefix = '-';
    tempValueString = tempValueString.substring(1, tempValueString.length);
  }

  try {
    const tempValue = Number(tempValueString);
    const fractionDigit = digit ?? 0;

    let mainNum = Number(`${Number(tempValue.toString())}e+${fractionDigit}`);
    if (!isSkipRound) {
      mainNum = floor ? Math.floor(mainNum) : Math.round(mainNum);
    }

    if (fractionDigit > 0) {
      const temp = +`${mainNum}e-${fractionDigit}`;
      let fractionString = '';
      let i = '';
      if (toFixed) {
        i = temp.toFixed(fractionDigit);
        fractionString = i.substring(i.indexOf('.'), i.length);
        i = i.substring(0, i.indexOf('.'));
        return (
          prefix + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + fractionString
        );
      }

      i = temp.toString();
      if (temp.toString().indexOf('.') >= 1) {
        fractionString = temp
          .toString()
          .substring(temp.toString().indexOf('.'), temp.toString().length);
        i = temp.toString().substring(0, temp.toString().indexOf('.'));
      }
      return prefix + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + fractionString;
    }

    const temp = +`${mainNum}e-${fractionDigit}`;
    const i = temp.toString();
    return prefix + i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch {
    return '';
  }
};
// ----------------------------------------------------------------------

/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

export type InputNumberValue = string | number | null | undefined;

type Options = Intl.NumberFormatOptions;

const DEFAULT_LOCALE = { code: 'en-US', currency: 'VNĐ' };

function processInput(inputValue: InputNumberValue): number | null {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputNumberValue, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue: InputNumberValue, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';
  const fm = formatNumber(number, {
    digit: 2,
  })

  return `${fm} VNĐ`;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputNumberValue, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputNumberValue, options?: Options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputNumberValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}
