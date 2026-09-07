import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentSession } from '../session.decorator';

// Nest's createParamDecorator stores the factory in route-args metadata rather
// than exposing it directly, so we recover it the way Nest's own docs recommend:
// apply the decorator inside a throwaway class and read the metadata back off it.
function getParamDecoratorFactory(decorator: Function): Function {
  class TestDecoratorHost {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public test(@(decorator() as any) _value: unknown) {}
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestDecoratorHost, 'test');
  return args[Object.keys(args)[0]].factory;
}

function makeContext(session: unknown): ExecutionContext {
  const client = { data: { session } };
  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as unknown as ExecutionContext;
}

describe('CurrentSession', () => {
  it('returns the session stored on the websocket client', () => {
    const factory = getParamDecoratorFactory(CurrentSession);
    const session = { userId: 'u1' };

    const result = factory(undefined, makeContext(session));

    expect(result).toBe(session);
  });

  it('returns undefined when the client has no session', () => {
    const factory = getParamDecoratorFactory(CurrentSession);

    const result = factory(undefined, makeContext(undefined));

    expect(result).toBeUndefined();
  });
});
