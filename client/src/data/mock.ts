import type { FrameworkUser } from '../types';

export const mockFrameworkUser: FrameworkUser = {
  id: 'user-001',
  name: 'Александр Петров',
  email: 'owner@payscan.local',
  streams: [
    {
      id: 'framework-core',
      type: 'core',
      label: 'Фреймворк',
      description: 'Базовая оболочка платформы',
      tenants: [
        {
          id: 'tenant-core-ops',
          title: 'Операционный центр',
          wallets: [
            { id: 'core-rub', currency: 'RUB', balance: 1250000 },
            { id: 'core-thb', currency: 'THB', balance: 980000 },
          ],
        },
      ],
    },
    {
      id: 'stream-personal',
      type: 'personal',
      label: 'Физические лица',
      description: 'Личный кабинет физического лица',
      tenants: [
        {
          id: 'tenant-personal-self',
          title: 'Личный кабинет',
          wallets: [
            { id: 'personal-rub', currency: 'RUB', balance: 152340.5 },
            { id: 'personal-thb', currency: 'THB', balance: 90210 },
            { id: 'personal-usd', currency: 'USD', balance: 5400 },
          ],
        },
      ],
    },
    {
      id: 'stream-b2b',
      type: 'b2b',
      label: 'Юридические лица',
      description: 'Выплаты поставщикам и партнёрам в Азии',
      tenants: [
        {
          id: 'tenant-biz-main',
          title: 'ООО «ПэйСкан Азия»',
          wallets: [
            { id: 'biz-rub', currency: 'RUB', balance: 2350000 },
            { id: 'biz-cny', currency: 'CNY', balance: 783000 },
          ],
        },
      ],
    },
  ],
};


