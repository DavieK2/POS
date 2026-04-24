import { DB as ProductDB } from "#modules/product/database/types";
import { DB as ordersDB } from "#modules/orders/database/types";
import { DB as userDB } from "#modules/user/database/types";

export interface DB extends ProductDB, ordersDB, userDB {}