import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    swap: 'Swap',
    limit: 'Limit',
    buy: 'Buy',
    sell: 'Sell',
    trading: 'Trading',
    explore: 'Explore',
    nfts: 'NFTs',
    pool: 'Pool',
    connect: 'Connect',
    search: 'Search tokens and NFT collections',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    // Trading interface translations
    when: 'When 1',
    hasValue: 'has value',
    market: 'Market',
    expires: 'Expires',
    youPay: 'You pay',
    youReceive: 'You receive',
    youSell: 'You sell',
    youBuy: 'You buy',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
    buyCrypto: 'Buy Crypto',
    sellCrypto: 'Sell Crypto',
    paymentMethod: 'Payment method',
    withdrawMethod: 'Withdraw method',
  },
  vi: {
    swap: 'Hoán đổi',
    limit: 'Giới hạn',
    buy: 'Mua',
    sell: 'Bán',
    trading: 'Giao dịch',
    explore: 'Khám phá',
    nfts: 'NFTs',
    pool: 'Pool',
    connect: 'Kết nối',
    search: 'Tìm kiếm token và bộ sưu tập NFT',
    language: 'Ngôn ngữ',
    theme: 'Giao diện',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    // Trading interface translations
    when: 'Khi 1',
    hasValue: 'có giá trị',
    market: 'Thị trường',
    expires: 'Hết hạn',
    youPay: 'Bạn trả',
    youReceive: 'Bạn nhận',
    youSell: 'Bạn bán',
    youBuy: 'Bạn mua',
    day: 'ngày',
    week: 'tuần',
    month: 'tháng',
    year: 'năm',
    buyCrypto: 'Mua Crypto',
    sellCrypto: 'Bán Crypto',
    paymentMethod: 'Phương thức thanh toán',
    withdrawMethod: 'Phương thức rút tiền',
  },
  zh: {
    swap: '交换',
    limit: '限价',
    buy: '购买',
    sell: '出售',
    trading: '交易',
    explore: '探索',
    nfts: 'NFTs',
    pool: '池子',
    connect: '连接',
    search: '搜索代币和NFT收藏',
    language: '语言',
    theme: '主题',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    // Trading interface translations
    when: '当 1',
    hasValue: '价值',
    market: '市场',
    expires: '到期',
    youPay: '您支付',
    youReceive: '您接收',
    youSell: '您出售',
    youBuy: '您购买',
    day: '天',
    week: '周',
    month: '月',
    year: '年',
    buyCrypto: '购买加密货币',
    sellCrypto: '出售加密货币',
    paymentMethod: '支付方式',
    withdrawMethod: '提取方式',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'vi', 'zh'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted) {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};