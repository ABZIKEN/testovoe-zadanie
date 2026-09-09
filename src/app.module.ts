import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ProfileModule } from './profile/profile.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    DatabaseModule,
    ProfileModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      graphiql: false,
      introspection: true,
      csrfPrevention: true,
      includeStacktraceInErrorResponses: false,
      allowBatchedHttpRequests: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({
        embed: { runTelemetry: false },
        document: `query BusinessCard {
  profile {
    name
    description
    links { label url }
    skills { name }
    experience { company position startDate endDate achievements }
    projects { name url }
  }
}`,
      })],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
