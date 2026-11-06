import { destroyFixtures } from "./fixtures";

export default async function globalTeardown(): Promise<void> {
  await destroyFixtures();
}
