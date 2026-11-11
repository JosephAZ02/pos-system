import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';

import {AuthModule} from './modules/auth/auth.module';
import {ProductsModule} from "./modules/products/product.module";
import {SalesModule} from './modules/sales/sales.module';

import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: config.get<number>('DB_PORT'),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'], //acá lo que hace es buscar todas las entidades y meterlas solo
                autoLoadEntities: true,
                synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
            }),
        }),
        AuthModule,
        ProductsModule,
        SalesModule,
        DashboardModule,
        ReportsModule
    ],
})
export class AppModule {
}