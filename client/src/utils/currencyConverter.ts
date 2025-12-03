// Примерные курсы валют (в реальном приложении нужно получать с API)
const EXCHANGE_RATES = {
  RUB: 1,        // 1 RUB = 1 RUB (для консистентности)
  USD: 90.5,     // 1 USD = 90.5 RUB
  EUR: 98.2,     // 1 EUR = 98.2 RUB
  THB: 2.5,      // 1 THB = 2.5 RUB (бат)
  CNY: 12.5,     // 1 CNY = 12.5 RUB
  JPY: 0.6,      // 1 JPY = 0.6 RUB
  GBP: 115.0,    // 1 GBP = 115.0 RUB
  // Добавьте другие валюты по необходимости
};

export type CurrencyCode = keyof typeof EXCHANGE_RATES;

export const convertToRUB = (
  amount: number, 
  fromCurrency: string
): number | null => {
  // Приводим к верхнему регистру для поиска
  const currencyKey = fromCurrency.toUpperCase() as CurrencyCode;
  const rate = EXCHANGE_RATES[currencyKey];
  
  if (!rate && rate !== 0) return null;
  return amount * rate;
};

export const formatWithConversion = (
  amount: number,
  currency: string,
  locale: string = 'ru-RU'
): {
  primary: string;
  secondary: string | null;
  isForeign: boolean;
} => {
  // Приводим валюту к верхнему регистру
  const normalizedCurrency = currency.toUpperCase();
  
  const primaryFormatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Если валюта уже RUB, не показываем конвертацию
  if (normalizedCurrency === 'RUB') {
    return {
      primary: `${primaryFormatted} ${currency}`,
      secondary: null,
      isForeign: false,
    };
  }

  const convertedAmount = convertToRUB(amount, normalizedCurrency);
  
  if (convertedAmount !== null) {
    const secondaryFormatted = convertedAmount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return {
      primary: `${primaryFormatted} ${currency}`,
      secondary: `≈ ${secondaryFormatted} RUB`,
      isForeign: true,
    };
  }

  // Если курс не найден, показываем только основную валюту
  return {
    primary: `${primaryFormatted} ${currency}`,
    secondary: null,
    isForeign: true,
  };
};

// Функция для получения значка валюты
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
    THB: '฿',
    CNY: '¥',
    JPY: '¥',
    GBP: '£',
  };
  
  const normalizedCurrency = currency.toUpperCase();
  return symbols[normalizedCurrency] || currency;
};

// Дополнительная функция для форматирования только с символом валюты
export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = 'ru-RU'
): string => {
  const formattedAmount = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${formattedAmount}`;
};