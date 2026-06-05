import { KeyObject } from "node:crypto";

let joseModulePromise: Promise<JoseModule> | undefined;

// jose is an ESM only module, and so we need to use dynamic imports in this
// CommonJS module:
//   https://community.developer.atlassian.com/t/are-there-specifications-for-the-4-endpoints-in-the-forge-assets-import-module/100980/5?u=lucastheisen
const getJose = () => {
  if (joseModulePromise === undefined) {
    joseModulePromise = import("jose");
  }
  return joseModulePromise;
};

type JoseModule = {
  jwtVerify: (
    token: string,
    key: KeyObject,
    options?: JWTVerifyOptions,
  ) => Promise<{ payload: JWTPayload }>,
  errors: {
    JOSEError: new (...args: any[]) => Error;
  };
};

export interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  jti?: string
  nbf?: number
  exp?: number
  iat?: number
  [propName: string]: unknown
}

interface JWTVerifyOptions {
  algorithms?: string[]
  audience?: string | string[]
  clockTolerance?: string | number
  requiredClaims?: string[]
}

export const isJOSEError = async (err: unknown): Promise<boolean> => {
  const { errors } = await getJose();
  return (err instanceof errors.JOSEError);
}

export const jwtVerify = async (
  jwt: string,
  key: KeyObject,
  options?: JWTVerifyOptions,
): Promise<JWTPayload> => {
  const { jwtVerify: dynamicJwtVerify } = await getJose();
  const { payload } = await dynamicJwtVerify(jwt, key, options)
  return payload
}
