import { Faker, en } from '@faker-js/faker';

export const fake = new Faker({ locale: [en] });

export * from './document-titles';