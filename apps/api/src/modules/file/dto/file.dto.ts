import { InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { UUIDField, StringField, BooleanField, } from '@sandworm/graphql';

export class FileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  path: string;
}


@InputType()
export class ListFilesInput {
  @UUIDField()
  workspaceId: string;

  @StringField({ nullable: true })
  path?: string;
}

@InputType()
export class GetFileInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  path: string;
}

@InputType()
export class UploadFileInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  fileName: string;

  @BooleanField({ nullable: true })
  replace?: boolean;
}

@InputType()
export class DeleteFileInput {
  @UUIDField()
  workspaceId: string;

  @StringField()
  path: string;
}