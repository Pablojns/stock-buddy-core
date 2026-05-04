-- Corrigindo a verificação de existência da coluna usando information_schema
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'reserved_quantity'
    ) THEN
        ALTER TABLE public.products ADD COLUMN reserved_quantity INTEGER DEFAULT 0;
    END IF;
END $$;

COMMENT ON COLUMN public.products.reserved_quantity IS 'Quantidade de produtos comprometidos com pedidos pendentes de separação';