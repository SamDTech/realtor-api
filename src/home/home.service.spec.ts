import { PropertyType } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { homeSelect, HomeService } from './home.service';

const getHomeMock = [
  {
    id: 1,
    address: '3, oyewale street',
    city: 'yaba',
    price: 300,
    propertyType: PropertyType.RESIDENTIAL,
    numberOfRooms: 3,
    numberOfBathrooms: 2,
    images: [
      {
        url: 'https://www.google.com',
      },
    ],
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(getHomeMock),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'yaba',
      propertyType: PropertyType.RESIDENTIAL,
      price: {
        gte: 200,
        lte: 900,
      },
    };
    it('should call home. findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(getHomeMock);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        where: {
          ...filters,
        },

        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
      });
    });
  });
});
