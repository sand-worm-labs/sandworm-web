import { getRandomIconColor } from '../color';

describe('getRandomIconColor', () => {
  it('returns one of the known icon filenames', () => {
    const allowed = ['red.png', 'blue.png', 'green.png', 'purple.png', 'yellow.png'];

    for (let i = 0; i < 20; i++) {
      expect(allowed).toContain(getRandomIconColor());
    }
  });

  it('picks the last color when Math.random rolls just under 1', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.999999);

    expect(getRandomIconColor()).toBe('yellow.png');

    randomSpy.mockRestore();
  });

  it('picks the first color when Math.random rolls 0', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    expect(getRandomIconColor()).toBe('red.png');

    randomSpy.mockRestore();
  });
});
