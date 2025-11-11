import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ClubCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterClubsDto {
  @ApiPropertyOptional({ enum: ClubCategory })
  @IsEnum(ClubCategory)
  @IsOptional()
  category?: ClubCategory;

  @ApiPropertyOptional({ example: 'DSA' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;
}


