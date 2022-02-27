import { HomeResponseDto } from './dto/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_rooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    return homes.map((home) => {
      const fetchedHomes = {
        ...home,
        image: home.images[0]?.url,
      };

      delete fetchedHomes.images;
      return new HomeResponseDto(fetchedHomes);
    });
  }
}
