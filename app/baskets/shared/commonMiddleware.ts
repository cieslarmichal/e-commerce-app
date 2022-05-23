import middy from '@middy/core';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpSecurityHeaders from '@middy/http-security-headers';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';

export function LoggerMiddleware<T, R>(): middy.MiddlewareObj<T, R> {
  return {
    onError: async (handler): Promise<void> => {
      const error = handler.error;

      console.log(error);
    },
  };
}

export const commonMiddleware = (handler: any) =>
  middy(handler).use([httpSecurityHeaders(), httpEventNormalizer(), LoggerMiddleware(), JSONErrorHandlerMiddleware()]);
