export * from './init';
export * from './reactivity';
export * from './router';
export * from './utils';
export * from 'shared/markdown';

export type AppConfig = {
  id: string;
  baseUrl: string;
  module: { [id: string]: unknown };
};
