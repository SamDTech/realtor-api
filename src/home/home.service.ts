import { HomeResponseDto } from './dto/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Image, PropertyType } from '@prisma/client';
import { IUser } from 'src/user/decorators/user.decorator';

interface IHomeParams {
  city?: string;
  propertyType?: PropertyType;
  price?: {
    gte?: number;
    lte?: number;
  };
}

interface ICreateHomeParams {
  address: string;
  images: { url: string }[];
  numberOfRooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
}

interface IUpdateHomeParams {
  address?: string;
  numberOfRooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filter: IHomeParams): Promise<HomeResponseDto[]> {
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

      where: filter,
    });

    if (homes.length === 0) {
      throw new Error('No homes found');
    }

    return homes.map((home) => {
      const fetchedHomes = {
        ...home,
        image: home.images[0]?.url,
      };

      delete fetchedHomes.images;
      return new HomeResponseDto(fetchedHomes);
    });
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findFirst({
      where: {
        id,
      },
    });

    if (!home) {
      throw new Error('No home found');
    }

    return new HomeResponseDto(home);
  }

  async createHome(
    {
      address,
      city,
      numberOfBathrooms,
      numberOfRooms,
      landSize,
      price,
      propertyType,
      images,
    }: ICreateHomeParams,
    userId: number,
  ): Promise<HomeResponseDto> {
    const createdHome = await this.prismaService.home.create({
      data: {
        address,
        city,
        number_of_bathrooms: numberOfBathrooms,
        number_of_rooms: numberOfRooms,
        land_size: landSize,
        price,
        propertyType,
        realtor_id: userId,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: createdHome.id };
    });

    await this.prismaService.image.createMany({ data: homeImages });

    return new HomeResponseDto(createdHome);
  }

  async updateHome(
    id: number,
    data: IUpdateHomeParams,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    await this.prismaService.image.deleteMany({
      where: {
        home_id: id,
      },
    });
    await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException('Home not found');
    }

    return home.realtor;
  }

  async inquire(homeId: number, buyer: IUser, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);

    return await this.prismaService.message.create({
      data: {
        message,
        buyer_id: buyer.id,
        realtor_id: realtor.id,
        home_id: homeId,
      },
    });
  }

  getHomeMessages(homeId: number) {
    return this.prismaService.message.findMany({
      where: {
        home_id: homeId,
      },
    });
  }
}
