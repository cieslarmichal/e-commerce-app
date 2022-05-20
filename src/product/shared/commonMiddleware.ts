import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';

export const commonMiddleware = (handler: any) => middy(handler).use([httpEventNormalizer(), httpErrorHandler()]);
