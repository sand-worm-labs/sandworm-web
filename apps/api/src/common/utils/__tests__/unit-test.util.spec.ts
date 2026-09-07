import { IsString, MinLength } from 'class-validator';
import { validateDto } from '../unit-test.util';

class TestDto {
  @IsString()
  @MinLength(3)
  name: string;
}

describe('validateDto', () => {
  it('resolves with no errors for a valid dto', async () => {
    const dto = new TestDto();
    dto.name = 'abc';

    expect(await validateDto(dto)).toEqual([]);
  });

  it('resolves with errors for an invalid dto', async () => {
    const dto = new TestDto();
    dto.name = 'a';

    const errors = await validateDto(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('flags unknown properties as an error when forbidNonWhitelisted defaults are used', async () => {
    const dto = new TestDto() as any;
    dto.name = 'abc';
    dto.extra = 'not allowed';

    const errors = await validateDto(dto);

    expect(errors.some((e) => e.property === 'extra')).toBe(true);
  });

  it('respects custom validator options passed in', async () => {
    const dto = new TestDto() as any;
    dto.name = 'abc';
    dto.extra = 'allowed here';

    const errors = await validateDto(dto, { whitelist: false, forbidNonWhitelisted: false });

    expect(errors).toEqual([]);
  });
});
