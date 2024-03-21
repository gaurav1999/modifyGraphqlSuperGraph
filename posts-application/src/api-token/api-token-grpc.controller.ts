import { Controller, Logger } from '@nestjs/common';

import { ApiTokenServiceController, ApiTokenServiceControllerMethods, UseAccessTokenRequest, UseAccessTokenResponse } from '../proto/token';
import { ApiTokenServiceNest } from './api-token.service';
import { Observable } from 'rxjs';

@Controller()
@ApiTokenServiceControllerMethods()
export class ApiTokenGrpcController implements ApiTokenServiceController {
  private readonly logger = new Logger(ApiTokenGrpcController.name);

  constructor(private readonly apiTokenService: ApiTokenServiceNest) {}

  useToken(request: UseAccessTokenRequest): UseAccessTokenResponse | Promise<UseAccessTokenResponse> | Observable<UseAccessTokenResponse> {
    return new Promise(async (resolve, reject) => {
        const token = await this.apiTokenService.useApiAccessToken(request.token);
        resolve({ result: token });
    });
  }
  
//  async useToken(request: UseAccessTokenRequest) {
//     this.logger.log(request);
//     const secretToken = await this.apiTokenService.useApiAccessToken(request.token);
//     return Promise.resolve({
//         token: secretToken
//     });
//   }
} 