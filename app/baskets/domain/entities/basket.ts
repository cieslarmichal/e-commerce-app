import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class Basket {
  @IsUUID('4')
  @IsOptional()
  public readonly id: string;

  @IsString()
  public readonly email: string;

  @IsArray()
  public readonly items: string[];
}
