import { Environment } from '../enums';

export interface MainConfiguration {
  readonly environment: Environment;
  readonly port: string | number;
  readonly hostname: string;
  readonly proxy: boolean | string;
}
