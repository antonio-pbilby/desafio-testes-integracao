import { createConnection } from 'typeorm';

export default async () => {
  return createConnection();
}