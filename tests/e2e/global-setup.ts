import { createFixtures } from "./fixtures";

export default async function globalSetup(): Promise<void> {
  await createFixtures();
}
