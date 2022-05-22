import { IsOptional, IsString, IsNumber } from 'class-validator';

export class Product {
  @IsString()
  public id?: string;

  @IsString()
  public name: string;

  @IsString()
  public category: string;

  @IsNumber()
  public price: number;

  @IsOptional()
  @IsString()
  public description?: string | null;
}
