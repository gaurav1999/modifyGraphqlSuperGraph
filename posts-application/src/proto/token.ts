/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "apitoken";

export interface UseAccessTokenRequest {
  token: string;
}

export interface UseAccessTokenResponse {
  /** Define any response fields if needed */
  result: string;
}

export const APITOKEN_PACKAGE_NAME = "apitoken";

export interface ApiTokenServiceClient {
  useToken(request: UseAccessTokenRequest): Observable<UseAccessTokenResponse>;
}

export interface ApiTokenServiceController {
  useToken(
    request: UseAccessTokenRequest,
  ): Promise<UseAccessTokenResponse> | Observable<UseAccessTokenResponse> | UseAccessTokenResponse;
}

export function ApiTokenServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["useToken"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ApiTokenService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ApiTokenService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const API_TOKEN_SERVICE_NAME = "ApiTokenService";
