import { BasketDto } from '../dtos';
import { CreateBasketData } from './types';
import { LoggerService } from '../../../common';
import { BasketRepository } from '../repositories/basketRepository';
import { BasketNotFoundError } from '../errors';
// import { CheckoutBasketEventPublisher } from '../events';

export class BasketService {
  public constructor(
    private readonly basketRepository: BasketRepository,
    // private readonly checkoutBasketEventPublisher: CheckoutBasketEventPublisher,
    private readonly loggerService: LoggerService,
  ) {}

  public async createBasket(basketData: CreateBasketData): Promise<BasketDto> {
    this.loggerService.debug('Creating basket...');

    const basket = await this.basketRepository.createOne({
      email: basketData.email,
      products: [],
    });

    this.loggerService.info('Basket created.', { basketId: basket.id });

    return basket;
  }

  public async findBasket(basketId: string): Promise<BasketDto> {
    this.loggerService.debug('Finding basket...', { basketId });

    const basket = await this.basketRepository.findOne(basketId);

    if (!basket) {
      throw new BasketNotFoundError(basketId);
    }

    this.loggerService.info('Basket found.', { basketId });

    return basket;
  }

  public async findBaskets(): Promise<BasketDto[]> {
    const baskets = await this.basketRepository.findMany();

    return baskets;
  }

  public async checkoutBasket(basketId: string): Promise<void> {
    this.loggerService.debug('Checking basket out...', { basketId });

    const basket = await this.basketRepository.findOne(basketId);

    if (!basket) {
      throw new BasketNotFoundError(basketId);
    }

    // this.checkoutBasketEventPublisher.publish({
    //   email: basket.email,
    //   products: [{ name, amount, price }],
    // });

    await this.basketRepository.removeOne(basketId);

    this.loggerService.info('Basket checked out.', { basketId });
  }

  public async addProductToBasket(basketId: string, productId: string): Promise<BasketDto> {
    this.loggerService.debug('Adding product to basket...', { basketId, productId });

    const basket = await this.basketRepository.findOne(basketId);

    if (!basket) {
      throw new BasketNotFoundError(basketId);
    }

    const updatedProducts = [...basket.products, productId];

    const updatedBasket = await this.basketRepository.updateOne(basketId, { products: updatedProducts });

    this.loggerService.info('Product added to basket.', { basketId, productId });

    return updatedBasket;
  }

  public async removeBasket(basketId: string): Promise<void> {
    this.loggerService.debug('Removing basket...', { basketId });

    await this.basketRepository.removeOne(basketId);

    this.loggerService.info('Basket removed.', { basketId });
  }
}
