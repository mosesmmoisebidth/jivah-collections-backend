import { Injectable } from '@nestjs/common';
import { EResponse } from 'src/common/enums/response-type.enum';
import { ResponseDto } from 'src/common/dtos';
import { ResponseService } from 'src/shared/response/response.service';
import { InternalServerErrorCustomException } from 'src/common/http';
@Injectable()
export class HealthService {
    constructor(
        private readonly responseService: ResponseService
    ){}
    getHealth(): ResponseDto<null> {
        try{
            return this.responseService.makeResponse({
                payload: null,
                message: `Server up and running`,
                responseType: EResponse.SUCCESS
            })
        }catch(error){
            throw new InternalServerErrorCustomException();
        }
    }
}