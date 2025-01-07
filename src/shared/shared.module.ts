import { Module } from '@nestjs/common';
import { ResponseModule } from './response/response.module';
import { LoggerModule } from './logger/logger.module';
import { MailerModule } from './mailer/mailer.module';
@Module({
    imports: [
        LoggerModule.forRoot(),
        MailerModule.forRoot(),
        ResponseModule.forRoot()
    ]
})

export class SharedModule{}