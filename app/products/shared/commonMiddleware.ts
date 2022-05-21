import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';

export const commonMiddleware = (handler: any) =>
  middy(handler).use([httpSecurityHeaders(), httpEventNormalizer(), JSONErrorHandlerMiddleware()]);
