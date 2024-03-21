import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { ApiToken, ExpiryTokenInput } from './entities/api-token.entity';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHmac, createCipher, createDecipher } from 'crypto';
import { AuthenticationError } from '@nestjs/apollo';
import { JwtService } from '@nestjs/jwt';



  
@Injectable()
export class ApiTokenServiceNest {
    private API_TOKEN_SALT: string
    private JWT_TOKEN_SECRET: string

    constructor(
        @InjectRepository(ApiToken)
        private readonly apiTokenRepository: Repository<ApiToken>,
        private configService: ConfigService,
        private jwtService: JwtService,

    ) {
        this.API_TOKEN_SALT = this.configService.get<string>('API_TOKEN_SALT');
        this.JWT_TOKEN_SECRET = this.configService.get<string>('JWT_TOKEN_SECRET');
        if (!this.API_TOKEN_SALT) throw new Error("API_TOKEN_SALT Required");
        if(!this.JWT_TOKEN_SECRET) throw new Error("JWT_TOKEN_STRING Required");
    }

    private encryptJwtToken(jwtToken: string, apiToken: string) {
        const cipher = createCipher('aes-256-cbc', apiToken);
        let encrypted = cipher.update(jwtToken, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    // Decryption
    private decryptJwtToken(encryptedJwtToken: string, apiToken: string) {
        const decipher = createDecipher('aes-256-cbc', apiToken);
        let decrypted = decipher.update(encryptedJwtToken, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    private async generateJwtTokenFromAclService(userId: string, legalEntityId: string, expiresAt: Date) {
        const payload = {
            userId,
            legalEntityId,
            clientType: 'API_TOKEN',
            iat: Date.now(),
        }
        if(expiresAt) payload['exp'] = expiresAt.getTime();
        const token = this.jwtService.sign(payload, { secret: this.JWT_TOKEN_SECRET });
        return token;
    }



    async create(expiry: ExpiryTokenInput, userId: string, legalEntityId: string): Promise<String> {
        //32 as we have fixed the api token to be of length 64.
        const apiToken = randomBytes(32).toString('hex');
        const accessKey = createHmac('sha512', this.API_TOKEN_SALT).update(apiToken).digest('hex');
        const data = this.apiTokenRepository.create({
            accessKey,
            userId,
            legalEntityId,
            permissionGroupId: '5525e5a8-4981-45cf-8e89-5193ceef5283', //TODO: Change this later

        });
        if (expiry !== ExpiryTokenInput.NONE) {
            let currentDate = new Date();
            switch (expiry) {
                case ExpiryTokenInput.WEEK: {
                    currentDate.setDate(currentDate.getDate() + 7); // Add 7 days for a week
                    break;
                }
                case ExpiryTokenInput.MONTH: {
                    currentDate.setMonth(currentDate.getMonth() + 1); // Add 1 month
                    break;
                }
                case ExpiryTokenInput.YEAR: {
                    currentDate.setFullYear(currentDate.getFullYear() + 1); // Add 1 year
                    break;
                }
                default: {
                    break;
                }
            }
            data.expiresAt = currentDate;
        }
        const token = await this.generateJwtTokenFromAclService(userId, legalEntityId, data.expiresAt);
        const encryptedJwtToken = this.encryptJwtToken(token, apiToken);
        data.jwtToken = encryptedJwtToken;
        await this.apiTokenRepository.save(data);
        return apiToken;
    }

    async useApiAccessToken(apiToken: string) {
        const accessKey = createHmac('sha512', this.API_TOKEN_SALT).update(apiToken).digest('hex');
        const data = await this.apiTokenRepository.findOne({ where: { accessKey, deletedAt: null } });
        if (!data) throw new AuthenticationError("Invalid Api Token");
        if(data.expiresAt.getTime() < new Date().getTime()) throw new AuthenticationError("Token Expired");
        return this.decryptJwtToken(data.jwtToken, apiToken);
    }

    async findAll(filter: FindManyOptions<ApiToken>): Promise<ApiToken[]> {
        return await this.apiTokenRepository.find(filter);
    }

    async remove(id: string): Promise<boolean> {
        await this.apiTokenRepository.update({ id }, { deletedAt: new Date() });
        return true;
    }
}
