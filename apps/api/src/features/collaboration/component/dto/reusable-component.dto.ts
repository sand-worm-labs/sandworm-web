import { InputType } from '@nestjs/graphql';
import {
    StringField,
    UUIDField,
    StringFieldOptional,
} from '@sandworm/graphql';
import { Field } from '@nestjs/graphql';
import { ReusableComponentType } from '@sandworm/postgresql-typeorm';

@InputType()
export class CreateReusableComponentInput {
    @UUIDField()
    documentId: string;

    @UUIDField()
    blockId: string;

    @StringField()
    title: string;

    @Field(() => ReusableComponentType)
    type: ReusableComponentType;

    @Field(() => String)
    state: string; // Base64 encoded
}

@InputType()
export class UpdateReusableComponentInput {
    @StringFieldOptional()
    title?: string;

    @Field(() => String, { nullable: true })
    state?: string;
}

@InputType()
export class CreateComponentInstanceInput {
    @UUIDField()
    documentId: string;

    @UUIDField()
    blockId: string;
}

@InputType()
export class DeleteComponentInstanceInput {
    @UUIDField()
    blockId: string;
}