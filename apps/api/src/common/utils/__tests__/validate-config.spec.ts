// class-transformer's implicit conversion reads TS design-type metadata,
// which requires the reflect-metadata polyfill to be loaded first.
import 'reflect-metadata';
import { IsInt, IsString, Max, Min } from 'class-validator';
import validateConfig from '../validate-config';

class TestEnvVariables {
  @IsString()
  NAME: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;
}

describe('validateConfig', () => {
  it('returns the validated (and transformed) config when it satisfies the class decorators', () => {
    const result = validateConfig({ NAME: 'app', PORT: '3000' }, TestEnvVariables);

    expect(result.NAME).toBe('app');
    expect(result.PORT).toBe(3000);
  });

  it('throws when a required property is missing', () => {
    expect(() => validateConfig({ NAME: 'app' }, TestEnvVariables)).toThrow();
  });

  it('throws when a property fails its validation constraint', () => {
    expect(() => validateConfig({ NAME: 'app', PORT: 'not-a-number' }, TestEnvVariables)).toThrow();
  });

  it('throws when a numeric property is out of range', () => {
    expect(() => validateConfig({ NAME: 'app', PORT: '99999' }, TestEnvVariables)).toThrow();
  });
});
