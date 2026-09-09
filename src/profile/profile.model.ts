import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfessionalLink {
  @Field() label!: string;
  @Field() url!: string;
}

@ObjectType()
export class Skill {
  @Field() name!: string;
}

@ObjectType()
export class Experience {
  @Field() company!: string;
  @Field() position!: string;
  @Field({ description: 'Inclusive starting month in YYYY-MM format' }) startDate!: string;
  @Field(() => String, { nullable: true, description: 'Last month in YYYY-MM format; null for current roles' })
  endDate!: string | null;
  @Field(() => [String]) achievements!: string[];
}

@ObjectType()
export class Project {
  @Field() name!: string;
  @Field() url!: string;
}

@ObjectType()
export class Profile {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => [ProfessionalLink]) links!: ProfessionalLink[];
  @Field(() => [Skill]) skills!: Skill[];
  @Field(() => [Experience]) experience!: Experience[];
  @Field(() => [Project]) projects!: Project[];
}
