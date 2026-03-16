import { getAdminSupabase, supabase } from './supabase';

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  promotional_price?: number;
  image: string;
  material: string;
  dbId: number;
}

export interface Product {
  id: string; // SKU or DB id as string
  name: string;
  category: string;
  price: number;
  promotional_price?: number;
  priceMin?: number;
  priceMax?: number;
  material: string;
  image: string;
  shortDesc: string;
  fullDesc: string;
  colors: string[];
  finishes: string[];
  variations?: ProductVariation[];
  isParent?: boolean;
}

/**
 * Mappings for categories to match frontend iconography/colors
 */
const CATEGORY_STYLES: Record<string, { icon: string, color: string }> = {
  colecionaveis: { icon: "sparkles", color: "#A855F7" },
  decoracao: { icon: "home", color: "#10B981" },
  industrial: { icon: "settings", color: "#3B82F6" },
  utilitarios: { icon: "wrench", color: "#F59E0B" },
  geral: { icon: "box", color: "#64748B" }
};

function pickBestImage(dbProd: any, allById: Map<number, any>): string {
  const fallback = '/assets/imagens/design_screen.png';
  const files = Array.isArray(dbProd?.product_files) ? dbProd.product_files : [];
  const imageFiles = files.filter((f: any) => !f?.tipo || f.tipo === 'image');

  if (imageFiles.length > 0) {
    const cover = dbProd?.cover_file_id
      ? imageFiles.find((f: any) => Number(f?.id) === Number(dbProd.cover_file_id))
      : null;
    const selected = cover || imageFiles[0];
    if (selected?.storage_path) return selected.storage_path;
  }

  if (dbProd?.is_variation && dbProd?.parent_product_id) {
    const parent = allById.get(Number(dbProd.parent_product_id));
    const parentFiles = Array.isArray(parent?.product_files) ? parent.product_files : [];
    const parentImages = parentFiles.filter((f: any) => !f?.tipo || f.tipo === 'image');

    if (parentImages.length > 0) {
      const parentCover = parent?.cover_file_id
        ? parentImages.find((f: any) => Number(f?.id) === Number(parent.cover_file_id))
        : null;
      const selectedParent = parentCover || parentImages[0];
      if (selectedParent?.storage_path) return selectedParent.storage_path;
    }
  }

  return fallback;
}

// Helper to convert DB product to Frontend Product interface
function mapDbProductToFrontend(dbProd: any, allById: Map<number, any>): Product {
  const resolvedImage = pickBestImage(dbProd, allById);

  const categoryName = dbProd.categories?.nome?.toLowerCase() || 'geral';

  return {
    id: dbProd.codigo_sku || dbProd.id.toString(),
    name: dbProd.nome,
    category: categoryName,
    price: dbProd.preco_venda || 0,
    promotional_price: dbProd.preco_promocional ? Number(dbProd.preco_promocional) : undefined,
    material: dbProd.material || 'PLA',
    image: resolvedImage,
    shortDesc: dbProd.descricao
      ? (dbProd.descricao.length > 80 ? `${dbProd.descricao.substring(0, 80)}...` : dbProd.descricao)
      : `${dbProd.nome} em impressão 3D`,
    fullDesc: dbProd.descricao || 'Detalhes do produto não informados.',
    colors: dbProd.cor ? dbProd.cor.split(',').map((c:string) => c.trim()) : ["Padrão"],
    finishes: ["Natural"]
  };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('products')
      .select('*, categories(nome), product_files(id, storage_path, tipo)')
      .eq('ativo', true)
      .order('id', { ascending: false });

    if (error) {
       console.error('Database Error:', error.message);
       return [];
    }

    if (!data || data.length === 0) {
       return [];
    }

    const allById = new Map<number, any>(data.map((p: any) => [Number(p.id), p]));

    // Separate parent products and variations
    const parents = data.filter((p: any) => !p.is_variation);
    const variations = data.filter((p: any) => p.is_variation);

    // Group variations by parent product
    const variationsByParent = new Map<number, any[]>();
    variations.forEach(v => {
      const parentId = Number(v.parent_product_id);
      if (parentId) {
        if (!variationsByParent.has(parentId)) {
          variationsByParent.set(parentId, []);
        }
        variationsByParent.get(parentId)!.push(v);
      }
    });

    // Map parent products with their variations
    const products = parents.map((parent: any) => {
      const product = mapDbProductToFrontend(parent, allById);
      const childVariations = variationsByParent.get(Number(parent.id)) || [];
      
      if (childVariations.length > 0) {
        product.isParent = true;
        product.variations = childVariations.map(v => ({
          id: v.codigo_sku || v.id.toString(),
          name: v.nome,
          price: v.preco_venda || 0,
          promotional_price: v.preco_promocional ? Number(v.preco_promocional) : undefined,
          image: pickBestImage(v, allById),
          material: v.material || 'PLA',
          dbId: Number(v.id)
        }));

        // Calculate min/max prices from parent + variations
        const parentPrice = parent.preco_promocional ? Number(parent.preco_promocional) : (parent.preco_venda || 0);
        const variationPrices = childVariations.map(v => v.preco_promocional ? Number(v.preco_promocional) : v.preco_venda || 0);
        const allPrices = [parentPrice, ...variationPrices];
        
        product.priceMin = Math.min(...allPrices);
        product.priceMax = Math.max(...allPrices);
        
        // Set main product price to parent's original price, or min if parent has no price
        if (product.price === 0) {
          product.price = product.priceMin;
        }
      }

      return product;
    });

    return products;
  } catch (err) {
    console.error('Error in getAllProducts:', err);

    // Fallback to public client in case service role is unavailable on the runtime.
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(nome), product_files(id, storage_path, tipo)')
        .eq('ativo', true)
        .order('id', { ascending: false });

      if (error || !data) return [];
      
      const allById = new Map<number, any>(data.map((p: any) => [Number(p.id), p]));
      const parents = data.filter((p: any) => !p.is_variation);
      const variations = data.filter((p: any) => p.is_variation);

      const variationsByParent = new Map<number, any[]>();
      variations.forEach(v => {
        const parentId = Number(v.parent_product_id);
        if (parentId) {
          if (!variationsByParent.has(parentId)) {
            variationsByParent.set(parentId, []);
          }
          variationsByParent.get(parentId)!.push(v);
        }
      });

      return parents.map((parent: any) => {
        const product = mapDbProductToFrontend(parent, allById);
        const childVariations = variationsByParent.get(Number(parent.id)) || [];
        
        if (childVariations.length > 0) {
          product.isParent = true;
          product.variations = childVariations.map(v => ({
            id: v.codigo_sku || v.id.toString(),
            name: v.nome,
            price: v.preco_venda || 0,
            promotional_price: v.preco_promocional ? Number(v.preco_promocional) : undefined,
            image: pickBestImage(v, allById),
            material: v.material || 'PLA',
            dbId: Number(v.id)
          }));

          const parentPrice = parent.preco_promocional ? Number(parent.preco_promocional) : (parent.preco_venda || 0);
          const variationPrices = childVariations.map(v => v.preco_promocional ? Number(v.preco_promocional) : v.preco_venda || 0);
          const allPrices = [parentPrice, ...variationPrices];
          
          product.priceMin = Math.min(...allPrices);
          product.priceMax = Math.max(...allPrices);
          
          if (product.price === 0) {
            product.price = product.priceMin;
          }
        }

        return product;
      });
    } catch {
      return [];
    }
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const isNumeric = /^\d+$/.test(id);
    const adminSupabase = getAdminSupabase();
    let query = adminSupabase
      .from('products')
      .select('*, categories(nome), product_files(id, storage_path, tipo)')
      .eq('ativo', true);
    
    if (isNumeric) query = query.eq('id', parseInt(id));
    else query = query.eq('codigo_sku', id);

    const { data, error } = await query.single();

    if (error || !data) {
       return undefined;
    }

    let parentProduct = data;
    // If it's a variation, load the parent product
    if (data.is_variation && data.parent_product_id) {
      const { data: parent } = await adminSupabase
        .from('products')
        .select('*, categories(nome), product_files(id, storage_path, tipo)')
        .eq('id', data.parent_product_id)
        .maybeSingle();
      if (parent) {
        parentProduct = parent;
      }
    }

    // Build context map with parent and all its variations
    const allById = new Map<number, any>([[Number(parentProduct.id), parentProduct]]);
    
    // Get all variations of this parent product
    const { data: variations } = await adminSupabase
      .from('products')
      .select('*, product_files(id, storage_path, tipo)')
      .eq('parent_product_id', Number(parentProduct.id))
      .eq('ativo', true);

    variations?.forEach((v: any) => {
      allById.set(Number(v.id), v);
    });

    const product = mapDbProductToFrontend(parentProduct, allById);

    // Add variations if parent has any
    if (variations && variations.length > 0) {
      product.isParent = true;
      product.variations = variations.map((v: any) => ({
        id: v.codigo_sku || v.id.toString(),
        name: v.nome,
        price: v.preco_venda || 0,
        promotional_price: v.preco_promocional ? Number(v.preco_promocional) : undefined,
        image: pickBestImage(v, allById),
        material: v.material || 'PLA',
        dbId: Number(v.id)
      }));

      // Calculate min/max prices from parent + variations
      const parentPrice = parentProduct.preco_promocional ? Number(parentProduct.preco_promocional) : (parentProduct.preco_venda || 0);
      const variationPrices = variations.map((v: any) => v.preco_promocional ? Number(v.preco_promocional) : v.preco_venda || 0);
      const allPrices = [parentPrice, ...variationPrices];
      
      product.priceMin = Math.min(...allPrices);
      product.priceMax = Math.max(...allPrices);

      if (product.price === 0) {
        product.price = product.priceMin;
      }
    }

    return product;

  } catch (err) {
    try {
      const isNumeric = /^\d+$/.test(id);
      let query = supabase
        .from('products')
        .select('*, categories(nome), product_files(id, storage_path, tipo)')
        .eq('ativo', true);

      if (isNumeric) query = query.eq('id', parseInt(id));
      else query = query.eq('codigo_sku', id);

      const { data, error } = await query.single();
      if (error || !data) return undefined;

      let parentProduct = data;
      if (data.is_variation && data.parent_product_id) {
        const { data: parent } = await supabase
          .from('products')
          .select('*, categories(nome), product_files(id, storage_path, tipo)')
          .eq('id', data.parent_product_id)
          .maybeSingle();
        if (parent) parentProduct = parent;
      }

      const allById = new Map<number, any>([[Number(parentProduct.id), parentProduct]]);
      const { data: variations } = await supabase
        .from('products')
        .select('*, product_files(id, storage_path, tipo)')
        .eq('parent_product_id', Number(parentProduct.id))
        .eq('ativo', true);

      variations?.forEach((v: any) => {
        allById.set(Number(v.id), v);
      });

      const product = mapDbProductToFrontend(parentProduct, allById);

      if (variations && variations.length > 0) {
        product.isParent = true;
        product.variations = variations.map((v: any) => ({
          id: v.codigo_sku || v.id.toString(),
          name: v.nome,
          price: v.preco_venda || 0,
          promotional_price: v.preco_promocional ? Number(v.preco_promocional) : undefined,
          image: pickBestImage(v, allById),
          material: v.material || 'PLA',
          dbId: Number(v.id)
        }));

        const parentPrice = parentProduct.preco_promocional ? Number(parentProduct.preco_promocional) : (parentProduct.preco_venda || 0);
        const variationPrices = variations.map((v: any) => v.preco_promocional ? Number(v.preco_promocional) : v.preco_venda || 0);
        const allPrices = [parentPrice, ...variationPrices];
        
        product.priceMin = Math.min(...allPrices);
        product.priceMax = Math.max(...allPrices);

        if (product.price === 0) {
          product.price = product.priceMin;
        }
      }

      return product;
    } catch {
      return undefined;
    }
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const { data } = await supabase.from('categories').select('nome');
    if (data && data.length > 0) {
       return data.map(c => c.nome.toLowerCase());
    }
    return [];
  } catch (err) {
    return [];
  }
}
