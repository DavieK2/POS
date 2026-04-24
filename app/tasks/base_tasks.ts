import { dbq } from "#config/db";
import { DB } from "#database/db_shema";
import AppErrors from "#exceptions/app_error";
import * as TE from "fp-ts/lib/TaskEither.js";
import { ControlledTransaction } from "kysely";
import { randomBytes } from "crypto";

export const startDBTrasaction = () => { 

    return TE.tryCatch(
        ()  => dbq.startTransaction().execute(),
        (e) => AppErrors.UnhandledError(e)
    )()
}

export const commitDBTrasaction = ( transaction: ControlledTransaction<DB, []> ) => { 

    return TE.tryCatch(
        ()  => transaction.commit().execute(),
        (e) => AppErrors.UnhandledError(e)
    )()
}

export function generateRandomNumber(length: number): string {
  if (length <= 0) throw new Error("Length must be greater than 0");
  
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}


export function generateRandomAlphanumericNumber(length: number): string {
    if (length <= 0) throw new Error("Length must be greater than 0");
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const bytes = randomBytes(length);
    let result = "";
    
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    
    return result;
}

export const formatCurrency = (n: number, withCurrency: boolean = true): string => {
  
    let options: Record<string, string> = {}

    if( withCurrency ){
        options['currency'] = "NGN"
        options['style'] = 'currency';
    }

    const formatter = new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        ...options
    });

    return formatter.format(n)
}