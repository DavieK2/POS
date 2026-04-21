

export interface ProductFormData {
    name: string;
    price: number;
    category?: string | null;
    description?: string | null;
    quantity?: number | null;
    image?: string | null;
}