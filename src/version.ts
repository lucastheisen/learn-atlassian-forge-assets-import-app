export interface BuildInfo {
  buildId: string;
  version: string;
}

declare const __BUILD_INFO__: BuildInfo;

export const buildInfo: BuildInfo = __BUILD_INFO__;
