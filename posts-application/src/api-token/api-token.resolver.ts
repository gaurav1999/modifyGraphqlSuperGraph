import {
    Args,
    Mutation,
    Query,
    Resolver,
  } from '@nestjs/graphql';
import { ApiToken, ExpiryTokenInput } from './entities/api-token.entity';
import { ApiTokenService } from './api-token.service';
  
  @Resolver((of) => ApiToken)
  export class ApiTokenResolver {
    constructor(private readonly apiTokenService: ApiTokenService) {}
  
    @Query(() => [ApiToken], { nullable: true })
    async listToken(@Args('userId') userId: string): Promise<ApiToken[]>{ 
        //TODO: Replace userId from token
        return this.apiTokenService.findAll({ where: { userId, deletedAt: null }, select: { id: true, userId: true, createdAt: true, updatedAt: true, expiresAt: true } });
    }

    @Query(() => String, { nullable: true, description: "Api to demonstrate use of token returning back jwt which will then be consumed by gateway internally" })
    async useToken(@Args('token') token: string) {
        return this.apiTokenService.useApiAccessToken('e84103c1f3bf910208a7ec3ca1d1ee7ecab1b104c6e894f49abe619b7cacd41e');
    }

    @Mutation(() => String, { nullable: false })
    async generateToken(@Args('expiry', { type: () => ExpiryTokenInput, nullable: false }) expiry: ExpiryTokenInput, userId: string): Promise<String>{ 
        return this.apiTokenService.create(expiry, '5525e5a8-4981-45cf-8e89-5193ceef5283', '5525e5a8-4981-45cf-8e89-5193ceef5283');
    }
 
  }
  