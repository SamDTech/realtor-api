import { PropertyType, UserType } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class HomeResponseDto {
  id: number;
  address: string;
  image: string;

  @Exclude()
  number_of_rooms: number;

  @Expose({ name: 'numberOfRooms' })
  getNumberOfRooms(): number {
    return this.number_of_rooms;
  }

  @Exclude()
  number_of_bathrooms: number;

  @Expose({ name: 'numberOfBathrooms' })
  getNumberOfBathrooms(): number {
    return this.number_of_bathrooms;
  }
  city: string;

  @Exclude()
  listed_date: Date;

  @Expose({ name: 'listedDate' })
  getListedDate(): Date {
    return this.listed_date;
  }

  price: number;

  @Exclude()
  land_size: number;

  @Expose({ name: 'landSize' })
  getLandSize(): number {
    return this.land_size;
  }

  propertyType: PropertyType;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}
