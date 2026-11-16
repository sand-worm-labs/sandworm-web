export type GraphQLError = { message: string; extensions?: { code?: string } };

export function isUnauthenticated(error: GraphQLError): boolean {
  return (
    error.extensions?.code === "UNAUTHENTICATED" ||
    /unauthori[sz]ed/i.test(error.message)
  );
}
