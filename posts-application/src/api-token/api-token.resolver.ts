import {
    Args,
    Mutation,
    Query,
    Resolver,
  } from '@nestjs/graphql';
import { ApiToken, ExpiryTokenInput } from './entities/api-token.entity';
import { ApiTokenServiceNest } from './api-token.service';
  
  @Resolver((of) => ApiToken)
  export class ApiTokenResolver {
    constructor(private readonly apiTokenService: ApiTokenServiceNest) {}
  
    @Query(() => [ApiToken], { nullable: true })
    async listToken(@Args('userId') userId: string): Promise<ApiToken[]>{ 
        return this.apiTokenService.findAll({ where: { userId, deletedAt: null }, select: { id: true, userId: true, createdAt: true, updatedAt: true, expiresAt: true } });
    }

    @Mutation(() => String, { nullable: false })
    async generateToken(@Args('expiry', { type: () => ExpiryTokenInput, nullable: false }) expiry: ExpiryTokenInput, userId: string): Promise<String>{ 
        return this.apiTokenService.create(expiry, '5525e5a8-4981-45cf-8e89-5193ceef5283', '5525e5a8-4981-45cf-8e89-5193ceef5283');
    }
 
  }
  